import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import AppError, NotFoundError
from app.models.proof import Proof
from app.models.notification import NotificationType
from app.repositories import proof_repository, collaboration_repository
from app.services import payment_service, transfer_service, notification_service

settings = get_settings()

_READ_CHUNK_SIZE = 1024 * 1024


async def read_bounded(file: UploadFile, max_size_mb: int) -> bytes:
    """Lit le fichier par blocs et interrompt dès que la taille max est dépassée,
    plutôt que de charger un corps de requête arbitrairement grand en mémoire avant
    de constater le dépassement (déni de service par épuisement mémoire)."""
    max_size = max_size_mb * 1024 * 1024
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(_READ_CHUNK_SIZE)
        if not chunk:
            break
        total += len(chunk)
        if total > max_size:
            raise AppError(f"Le fichier dépasse la taille maximale autorisée ({max_size_mb} Mo).")
        chunks.append(chunk)
    return b"".join(chunks)

_ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}

# Signatures binaires ("magic bytes") des formats acceptés : le Content-Type déclaré par le
# client n'est qu'une indication, jamais une garantie — un client pourrait envoyer un fichier
# arbitraire en mentant sur son Content-Type. On vérifie donc aussi les premiers octets réels.
def _matches_signature(content_type: str, content: bytes) -> bool:
    if content_type == "image/jpeg":
        return content.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    if content_type == "application/pdf":
        return content.startswith(b"%PDF-")
    return False


def _validate_file(content_type: str | None, content: bytes) -> str:
    if content_type not in _ALLOWED_CONTENT_TYPES:
        raise AppError(
            "Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WEBP, PDF."
        )
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise AppError(f"Le fichier dépasse la taille maximale autorisée ({settings.max_upload_size_mb} Mo).")
    if len(content) == 0:
        raise AppError("Le fichier est vide.")
    if not _matches_signature(content_type, content):
        raise AppError(
            "Le contenu du fichier ne correspond pas au type déclaré. Formats acceptés : JPEG, PNG, WEBP, PDF."
        )
    return _ALLOWED_CONTENT_TYPES[content_type]


def _store_file(company_id: uuid.UUID, extension: str, content: bytes) -> str:
    company_dir = Path(settings.upload_dir) / str(company_id)
    company_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4()}{extension}"
    destination = company_dir / stored_name
    destination.write_bytes(content)
    return str(destination)


async def upload_transfer_proof(
    session: AsyncSession,
    company_id: uuid.UUID,
    uploaded_by_id: uuid.UUID,
    transfer_id: uuid.UUID,
    file_name: str,
    content_type: str | None,
    content: bytes,
    note: str | None,
) -> Proof:
    transfer = await transfer_service.get_transfer(session, company_id, transfer_id)
    extension = _validate_file(content_type, content)
    storage_path = _store_file(company_id, extension, content)
    proof = Proof(
        company_id=company_id,
        transfer_id=transfer_id,
        uploaded_by_id=uploaded_by_id,
        file_name=file_name[:255],
        storage_path=storage_path,
        content_type=content_type,
        file_size=len(content),
        note=note,
    )
    proof = await proof_repository.create(session, proof)
    
    collaboration = await collaboration_repository.get_by_id(session, transfer.collaboration_id)
    if collaboration:
        other_party_id = (
            collaboration.target_company_id
            if company_id == collaboration.initiator_company_id
            else collaboration.initiator_company_id
        )
        await notification_service.notify(
            session,
            other_party_id,
            NotificationType.PROOF_UPLOADED,
            f"Une preuve a été ajoutée pour l'envoi {transfer.reference}.",
            link_type="transfer",
            link_id=transfer.id,
        )

    await session.commit()
    return proof


async def upload_payment_proof(
    session: AsyncSession,
    company_id: uuid.UUID,
    uploaded_by_id: uuid.UUID,
    payment_id: uuid.UUID,
    file_name: str,
    content_type: str | None,
    content: bytes,
    note: str | None,
) -> Proof:
    payment = await payment_service.get_payment(session, company_id, payment_id)
    extension = _validate_file(content_type, content)
    storage_path = _store_file(company_id, extension, content)
    proof = Proof(
        company_id=company_id,
        payment_id=payment_id,
        uploaded_by_id=uploaded_by_id,
        file_name=file_name[:255],
        storage_path=storage_path,
        content_type=content_type,
        file_size=len(content),
        note=note,
    )
    proof = await proof_repository.create(session, proof)

    collaboration = await collaboration_repository.get_by_id(session, payment.collaboration_id)
    if collaboration:
        other_party_id = (
            collaboration.target_company_id
            if company_id == collaboration.initiator_company_id
            else collaboration.initiator_company_id
        )
        await notification_service.notify(
            session,
            other_party_id,
            NotificationType.PROOF_UPLOADED,
            f"Une preuve a été ajoutée pour le paiement {payment.reference}.",
            link_type="payment",
            link_id=payment.id,
        )

    await session.commit()
    return proof


async def list_transfer_proofs(session: AsyncSession, company_id: uuid.UUID, transfer_id: uuid.UUID) -> list[Proof]:
    await transfer_service.get_transfer(session, company_id, transfer_id)
    return await proof_repository.list_by_transfer(session, transfer_id)


async def list_payment_proofs(session: AsyncSession, company_id: uuid.UUID, payment_id: uuid.UUID) -> list[Proof]:
    await payment_service.get_payment(session, company_id, payment_id)
    return await proof_repository.list_by_payment(session, payment_id)


async def get_transfer_proof_file(
    session: AsyncSession, company_id: uuid.UUID, transfer_id: uuid.UUID, proof_id: uuid.UUID
) -> Proof:
    await transfer_service.get_transfer(session, company_id, transfer_id)
    proof = await proof_repository.get_by_id(session, proof_id)
    if proof is None or proof.transfer_id != transfer_id:
        raise NotFoundError("Preuve introuvable.")
    return proof


async def get_payment_proof_file(
    session: AsyncSession, company_id: uuid.UUID, payment_id: uuid.UUID, proof_id: uuid.UUID
) -> Proof:
    await payment_service.get_payment(session, company_id, payment_id)
    proof = await proof_repository.get_by_id(session, proof_id)
    if proof is None or proof.payment_id != payment_id:
        raise NotFoundError("Preuve introuvable.")
    return proof
