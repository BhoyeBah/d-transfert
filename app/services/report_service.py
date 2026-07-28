import csv
import io
import uuid
from datetime import date, timedelta

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.collaboration import CollaborationStatus
from app.models.national_operation import NationalOperationType
from app.models.payment import PaymentStatus
from app.models.transfer import TransferStatus
from app.repositories import (
    audit_log_repository,
    client_repository,
    collaboration_repository,
    collaborator_balance_repository,
    company_repository,
    entry_repository,
    national_operation_repository,
    payment_repository,
    supplier_repository,
    transfer_repository,
    user_repository,
    wallet_movement_repository,
    wallet_repository,
)
from app.schemas.dashboard import CollaboratorBalanceSummary
from app.schemas.report import (
    ClientMovementReportRow,
    EmployeeActivityRow,
    FeeReportRow,
    MonthlyReportResponse,
    RejectedOperationReportRow,
    SupplierMovementReportRow,
    TransactionReportRow,
    WalletMovementReportRow,
)

def rows_to_csv(rows: list[BaseModel], model_cls: type[BaseModel]) -> str:
    buffer = io.StringIO()
    fieldnames = list(model_cls.model_fields.keys())
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow({key: ("" if value is None else str(value)) for key, value in row.model_dump().items()})
    return buffer.getvalue()


async def _aggregate_period(session: AsyncSession, company_id: uuid.UUID, date_from: date, date_to: date) -> dict:
    # Agrégats calculés directement en SQL (COUNT/SUM/GROUP BY) plutôt qu'en chargeant tout
    # l'historique de l'entreprise pour compter en Python — ne scale pas avec des années
    # d'historique sinon.
    operation_counts = await national_operation_repository.count_by_type_in_period(
        session, company_id, date_from, date_to
    )
    entries_count, entries_total_by_currency = await entry_repository.aggregate_in_period(
        session, company_id, date_from, date_to
    )
    transfer_counts = await transfer_repository.count_by_status_in_period(session, company_id, date_from, date_to)
    payment_counts = await payment_repository.count_by_status_in_period(session, company_id, date_from, date_to)

    return {
        "deposits_count": operation_counts.get(NationalOperationType.DEPOSIT.value, 0),
        "withdrawals_count": operation_counts.get(NationalOperationType.WITHDRAWAL.value, 0),
        "exchanges_count": operation_counts.get(NationalOperationType.EXCHANGE.value, 0),
        "rebalances_count": operation_counts.get(NationalOperationType.REBALANCE.value, 0),
        "entries_count": entries_count,
        "entries_total_by_currency": entries_total_by_currency,
        "transfers_created_count": sum(transfer_counts.values()),
        "transfers_approved_count": transfer_counts.get(TransferStatus.APPROVED.value, 0),
        "transfers_rejected_count": transfer_counts.get(TransferStatus.REJECTED.value, 0),
        "payments_created_count": sum(payment_counts.values()),
        "payments_approved_count": payment_counts.get(PaymentStatus.APPROVED.value, 0),
        "payments_rejected_count": payment_counts.get(PaymentStatus.REJECTED.value, 0),
    }


async def build_monthly_report(
    session: AsyncSession, company_id: uuid.UUID, year: int, month: int
) -> MonthlyReportResponse:
    start = date(year, month, 1)
    end = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
    data = await _aggregate_period(session, company_id, start, end)
    return MonthlyReportResponse(month=f"{year:04d}-{month:02d}", **data)


def monthly_report_to_csv(report: MonthlyReportResponse) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["metric", "value"])
    writer.writerow(["month", report.month])
    writer.writerow(["deposits_count", report.deposits_count])
    writer.writerow(["withdrawals_count", report.withdrawals_count])
    writer.writerow(["exchanges_count", report.exchanges_count])
    writer.writerow(["rebalances_count", report.rebalances_count])
    writer.writerow(["entries_count", report.entries_count])
    for currency, amount in report.entries_total_by_currency.items():
        writer.writerow([f"entries_total_{currency}", amount])
    writer.writerow(["transfers_created_count", report.transfers_created_count])
    writer.writerow(["transfers_approved_count", report.transfers_approved_count])
    writer.writerow(["transfers_rejected_count", report.transfers_rejected_count])
    writer.writerow(["payments_created_count", report.payments_created_count])
    writer.writerow(["payments_approved_count", report.payments_approved_count])
    writer.writerow(["payments_rejected_count", report.payments_rejected_count])
    return buffer.getvalue()


# Pour les rapports qui fusionnent plusieurs tables (transactions, frais, opérations rejetées),
# chaque source est bornée par la période demandée directement en SQL (jamais l'historique
# complet de l'entreprise), puis les résultats sont fusionnés/triés/paginés en Python — un vrai
# UNION SQL paginé sur des tables hétérogènes serait disproportionné pour ce volume de données.
_MERGE_FETCH_CAP = 2000
# Borne dure sur les exports CSV : un export demande "tout" pour la période plutôt qu'une page,
# mais doit rester borné pour ne pas matérialiser un CSV de taille arbitraire.
CSV_EXPORT_MAX_ROWS = 5000


def _paginate_rows(rows: list, page: int, page_size: int) -> tuple[list, int]:
    total = len(rows)
    start = (page - 1) * page_size
    return rows[start : start + page_size], total


async def build_transactions_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[TransactionReportRow], int]:
    rows: list[TransactionReportRow] = []

    transfers, _ = await transfer_repository.list_for_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to
    )
    for transfer in transfers:
        rows.append(
            TransactionReportRow(
                kind="transfer",
                reference=transfer.reference,
                type_or_mode=transfer.send_mode.value,
                amount=transfer.amount,
                currency=transfer.currency,
                status=transfer.status.value,
                created_at=transfer.created_at,
            )
        )

    payments, _ = await payment_repository.list_for_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to
    )
    for payment in payments:
        rows.append(
            TransactionReportRow(
                kind="payment",
                reference=payment.reference,
                type_or_mode="payment",
                amount=payment.amount,
                currency=payment.currency,
                status=payment.status.value,
                created_at=payment.created_at,
            )
        )

    operations, _ = await national_operation_repository.list_by_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to
    )
    for operation in operations:
        rows.append(
            TransactionReportRow(
                kind="national_operation",
                reference=operation.reference,
                type_or_mode=operation.type.value,
                amount=None,
                currency=None,
                status=operation.status.value,
                created_at=operation.created_at,
            )
        )

    rows.sort(key=lambda row: row.created_at)
    return _paginate_rows(rows, page, page_size)


async def build_collaborator_balances_report(
    session: AsyncSession, company_id: uuid.UUID
) -> list[CollaboratorBalanceSummary]:
    collaborations = await collaboration_repository.list_for_company(session, company_id)
    rows: list[CollaboratorBalanceSummary] = []
    for collaboration in collaborations:
        if collaboration.status != CollaborationStatus.ACCEPTED:
            continue
        balance = await collaborator_balance_repository.get_balance_for_company(
            session, collaboration.id, company_id
        )
        collaborator_company_id = (
            collaboration.target_company_id
            if collaboration.initiator_company_id == company_id
            else collaboration.initiator_company_id
        )
        collaborator_company = await company_repository.get_by_id(session, collaborator_company_id)
        rows.append(
            CollaboratorBalanceSummary(
                collaboration_id=collaboration.id,
                collaborator_company_id=collaborator_company_id,
                collaborator_company_name=collaborator_company.name if collaborator_company else "—",
                collaborator_company_matricule=(
                    collaborator_company.registration_code if collaborator_company else "—"
                ),
                currency=collaboration.currency,
                balance=balance,
            )
        )
    return rows


async def build_wallet_history_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    wallet_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[WalletMovementReportRow], int]:
    wallet = await wallet_repository.get_by_company_and_id(session, company_id, wallet_id)
    if wallet is None:
        raise NotFoundError("Wallet introuvable.")
    movements, total = await wallet_movement_repository.list_by_wallet_in_period(
        session, wallet_id, page, page_size, date_from, date_to
    )
    rows = [
        WalletMovementReportRow(
            id=movement.id,
            direction=movement.direction.value,
            amount=movement.amount,
            currency=movement.currency,
            balance_before=movement.balance_before,
            balance_after=movement.balance_after,
            source_type=movement.source_type,
            source_id=movement.source_id,
            note=movement.note,
            created_at=movement.created_at,
        )
        for movement in movements
    ]
    return rows, total


async def build_employee_activity_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    user_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[EmployeeActivityRow], int]:
    employee = await user_repository.get_by_company_and_id(session, company_id, user_id)
    if employee is None:
        raise NotFoundError("Employé introuvable.")
    logs, total = await audit_log_repository.list_by_employee_in_period(
        session, company_id, user_id, page, page_size, date_from, date_to
    )
    rows = [
        EmployeeActivityRow(
            id=log.id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            note=log.note,
            created_at=log.created_at,
        )
        for log in logs
    ]
    return rows, total


async def build_supplier_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[SupplierMovementReportRow], int]:
    results, total = await supplier_repository.list_movements_for_company_in_period(
        session, company_id, page, page_size, date_from, date_to
    )
    rows = [
        SupplierMovementReportRow(
            id=movement.id,
            supplier_id=movement.supplier_id,
            supplier_name=supplier_name,
            reference=movement.reference,
            type=movement.type.value,
            amount=movement.amount,
            balance_after=movement.balance_after,
            created_at=movement.created_at,
        )
        for movement, supplier_name in results
    ]
    return rows, total


async def build_client_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[ClientMovementReportRow], int]:
    results, total = await client_repository.list_movements_for_company_in_period(
        session, company_id, page, page_size, date_from, date_to
    )
    rows = [
        ClientMovementReportRow(
            id=movement.id,
            client_id=movement.client_id,
            client_name=client_name,
            delta=movement.delta,
            balance_after=movement.balance_after,
            source_type=movement.source_type,
            created_at=movement.created_at,
        )
        for movement, client_name in results
    ]
    return rows, total


async def build_fees_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[FeeReportRow], int]:
    rows: list[FeeReportRow] = []

    transfers, _ = await transfer_repository.list_for_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to, only_with_fee=True
    )
    for transfer in transfers:
        rows.append(
            FeeReportRow(
                source_type="transfer",
                source_id=transfer.id,
                amount=transfer.fee_amount,
                currency=transfer.currency,
                created_at=transfer.created_at,
            )
        )

    payments, _ = await payment_repository.list_for_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to, only_with_fee=True
    )
    for payment in payments:
        rows.append(
            FeeReportRow(
                source_type="payment",
                source_id=payment.id,
                amount=payment.fee_amount,
                currency=payment.currency,
                created_at=payment.created_at,
            )
        )

    rows.sort(key=lambda row: row.created_at)
    return _paginate_rows(rows, page, page_size)


async def build_rejected_operations_report(
    session: AsyncSession,
    company_id: uuid.UUID,
    date_from: date | None,
    date_to: date | None,
    page: int = 1,
    page_size: int = CSV_EXPORT_MAX_ROWS,
) -> tuple[list[RejectedOperationReportRow], int]:
    rows: list[RejectedOperationReportRow] = []

    transfers, _ = await transfer_repository.list_for_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to, only_rejected=True
    )
    for transfer in transfers:
        rows.append(
            RejectedOperationReportRow(
                kind="transfer",
                reference=transfer.reference,
                reason=transfer.rejection_reason,
                created_at=transfer.rejected_at or transfer.created_at,
            )
        )

    payments, _ = await payment_repository.list_for_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to, only_rejected=True
    )
    for payment in payments:
        rows.append(
            RejectedOperationReportRow(
                kind="payment",
                reference=payment.reference,
                reason=payment.rejection_reason,
                created_at=payment.rejected_at or payment.created_at,
            )
        )

    operations, _ = await national_operation_repository.list_by_company_in_period(
        session, company_id, 1, _MERGE_FETCH_CAP, date_from, date_to, only_cancelled=True
    )
    for operation in operations:
        rows.append(
            RejectedOperationReportRow(
                kind="national_operation",
                reference=operation.reference,
                reason=None,
                created_at=operation.cancelled_at or operation.created_at,
            )
        )

    rows.sort(key=lambda row: row.created_at)
    return _paginate_rows(rows, page, page_size)
