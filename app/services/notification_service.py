import asyncio
import logging
import uuid

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session as SyncSession

from app.core.exceptions import NotFoundError
from app.core.notification_broadcaster import get_notification_broadcaster
from app.models.notification import Notification, NotificationType
from app.repositories import notification_repository, user_repository
from app.schemas.notification import NotificationResponse
from app.services import notification_channel_service

logger = logging.getLogger("dtransfert.notifications")

_PENDING_BROADCASTS_KEY = "pending_notification_broadcasts"
_PENDING_EXTERNAL_DISPATCH_KEY = "pending_notification_external_dispatch"


async def notify(
    session: AsyncSession,
    company_id: uuid.UUID,
    type: NotificationType,
    message: str,
    link_type: str | None = None,
    link_id: uuid.UUID | None = None,
) -> Notification:
    notification = await notification_repository.create(session, company_id, type, message, link_type, link_id)
    # Mise en attente jusqu'après le commit (cf. _broadcast_after_commit ci-dessous) : si la
    # transaction englobante échoue et annule tout, aucune notification "fantôme" ne doit être
    # diffusée aux clients connectés en direct (ni envoyée par email/SMS/WhatsApp).
    payload = NotificationResponse.model_validate(notification, from_attributes=True).model_dump(mode="json")
    session.info.setdefault(_PENDING_BROADCASTS_KEY, []).append((company_id, payload))

    owner = await user_repository.get_owner_by_company(session, company_id)
    if owner is not None and (owner.email or owner.phone):
        session.info.setdefault(_PENDING_EXTERNAL_DISPATCH_KEY, []).append((owner.email, owner.phone, message))

    return notification


@event.listens_for(SyncSession, "after_commit")
def _broadcast_after_commit(session: SyncSession) -> None:
    pending = session.info.pop(_PENDING_BROADCASTS_KEY, None)
    if pending:
        broadcaster = get_notification_broadcaster()
        for company_id, payload in pending:
            broadcaster.publish(company_id, payload)

    pending_dispatch = session.info.pop(_PENDING_EXTERNAL_DISPATCH_KEY, None)
    if pending_dispatch:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            # Pas de boucle asyncio en cours (ex. script synchrone) : le canal externe est
            # ignoré, seule la notification interne (déjà persistée) reste disponible.
            logger.warning("Aucune boucle asyncio active : notifications externes ignorées.")
            return
        for to_email, to_phone, message in pending_dispatch:
            loop.create_task(
                notification_channel_service.dispatch(to_email, to_phone, "D-Transfert", message)
            )


@event.listens_for(SyncSession, "after_rollback")
def _discard_pending_after_rollback(session: SyncSession) -> None:
    session.info.pop(_PENDING_BROADCASTS_KEY, None)
    session.info.pop(_PENDING_EXTERNAL_DISPATCH_KEY, None)


async def list_notifications(session: AsyncSession, company_id: uuid.UUID) -> list[Notification]:
    return await notification_repository.list_by_company(session, company_id)


async def mark_as_read(
    session: AsyncSession, company_id: uuid.UUID, notification_id: uuid.UUID
) -> Notification:
    notification = await notification_repository.get_by_company_and_id(session, company_id, notification_id)
    if notification is None:
        raise NotFoundError("Notification introuvable.")
    notification.is_read = True
    await session.commit()
    return notification
