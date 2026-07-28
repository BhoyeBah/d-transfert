import csv
import io
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collaboration import Collaboration, CollaborationStatus
from app.models.national_operation import NationalOperationType
from app.models.payment import PaymentStatus
from app.models.transfer import TransferStatus
from app.models.wallet import WalletStatus
from app.repositories import (
    client_repository,
    collaboration_repository,
    collaborator_balance_repository,
    company_repository,
    entry_repository,
    national_operation_repository,
    notification_repository,
    payment_repository,
    supplier_repository,
    transfer_repository,
    wallet_repository,
)
from app.schemas.dashboard import (
    CollaboratorBalanceSummary,
    DailyReportResponse,
    DashboardAlert,
    DashboardResponse,
    EmployeeDashboardResponse,
)
from app.services import pdf_export

PENDING_ALERT_THRESHOLD_HOURS = 72


def _other_party(collaboration: Collaboration, company_id: uuid.UUID) -> uuid.UUID:
    if collaboration.initiator_company_id == company_id:
        return collaboration.target_company_id
    return collaboration.initiator_company_id


def _is_today(created_at: datetime) -> bool:
    return created_at.astimezone(timezone.utc).date() == datetime.now(timezone.utc).date()


def _hours_since(created_at: datetime) -> float:
    return (datetime.now(timezone.utc) - created_at.astimezone(timezone.utc)).total_seconds() / 3600


async def build_dashboard(session: AsyncSession, company_id: uuid.UUID) -> DashboardResponse:
    alerts: list[DashboardAlert] = []

    wallets = await wallet_repository.list_by_company(session, company_id)
    wallets_balance_by_currency: dict[str, Decimal] = defaultdict(Decimal)
    for wallet in wallets:
        if wallet.status == WalletStatus.ACTIVE:
            wallets_balance_by_currency[wallet.currency] += wallet.balance
            if wallet.balance < 0:
                alerts.append(
                    DashboardAlert(
                        severity="critical",
                        message=f"Le wallet {wallet.name} est en solde négatif : {wallet.balance} {wallet.currency}.",
                    )
                )

    collaborations = await collaboration_repository.list_for_company(session, company_id)
    collaborator_balances = []
    active_collaborations_count = 0
    for collaboration in collaborations:
        if collaboration.status != CollaborationStatus.ACCEPTED:
            continue
        active_collaborations_count += 1
        balance = await collaborator_balance_repository.get_balance_for_company(
            session, collaboration.id, company_id
        )
        collaborator_company_id = _other_party(collaboration, company_id)
        collaborator_company = await company_repository.get_by_id(session, collaborator_company_id)
        collaborator_balances.append(
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

    entries = await entry_repository.list_by_company(session, company_id)
    entries_today_count = sum(1 for entry in entries if _is_today(entry.created_at))

    national_operations = await national_operation_repository.list_by_company(session, company_id)
    national_operations_today_count = sum(
        1 for operation in national_operations if _is_today(operation.created_at)
    )

    transfers = await transfer_repository.list_for_company(session, company_id)
    transfers_today_count = sum(1 for transfer in transfers if _is_today(transfer.created_at))
    transfers_pending_count = sum(1 for transfer in transfers if transfer.status == TransferStatus.PENDING)
    transfers_rejected_count = sum(
        1 for transfer in transfers if transfer.status == TransferStatus.REJECTED
    )
    for transfer in transfers:
        if (
            transfer.status == TransferStatus.PENDING
            and _hours_since(transfer.created_at) >= PENDING_ALERT_THRESHOLD_HOURS
        ):
            alerts.append(
                DashboardAlert(
                    severity="warning",
                    message=f"L'envoi {transfer.reference} est en attente depuis plus de "
                    f"{PENDING_ALERT_THRESHOLD_HOURS // 24} jours.",
                )
            )

    payments = await payment_repository.list_for_company(session, company_id)
    payments_today_count = sum(1 for payment in payments if _is_today(payment.created_at))
    payments_pending_count = sum(1 for payment in payments if payment.status == PaymentStatus.PENDING)
    payments_rejected_count = sum(1 for payment in payments if payment.status == PaymentStatus.REJECTED)
    for payment in payments:
        if (
            payment.status == PaymentStatus.PENDING
            and _hours_since(payment.created_at) >= PENDING_ALERT_THRESHOLD_HOURS
        ):
            alerts.append(
                DashboardAlert(
                    severity="warning",
                    message=f"Le paiement {payment.reference} est en attente depuis plus de "
                    f"{PENDING_ALERT_THRESHOLD_HOURS // 24} jours.",
                )
            )

    clients = await client_repository.list_by_company(session, company_id)
    clients_balances_by_currency = await client_repository.get_balances_by_currency_for_clients(
        session, [c.id for c in clients]
    )
    clients_total_balance: dict[str, Decimal] = defaultdict(Decimal)
    for balances in clients_balances_by_currency.values():
        for currency, balance in balances:
            clients_total_balance[currency] += balance

    suppliers = await supplier_repository.list_by_company(session, company_id)
    suppliers_total_balance: dict[str, Decimal] = defaultdict(Decimal)
    for supplier in suppliers:
        suppliers_total_balance[supplier.currency] += supplier.balance

    notifications = await notification_repository.list_by_company(session, company_id)
    unread_notifications_count = sum(1 for n in notifications if not n.is_read)

    return DashboardResponse(
        wallets_balance_by_currency=dict(wallets_balance_by_currency),
        collaborator_balances=collaborator_balances,
        active_collaborations_count=active_collaborations_count,
        entries_today_count=entries_today_count,
        national_operations_today_count=national_operations_today_count,
        transfers_today_count=transfers_today_count,
        transfers_pending_count=transfers_pending_count,
        transfers_rejected_count=transfers_rejected_count,
        payments_today_count=payments_today_count,
        payments_pending_count=payments_pending_count,
        payments_rejected_count=payments_rejected_count,
        clients_total_balance=dict(clients_total_balance),
        suppliers_total_balance=dict(suppliers_total_balance),
        unread_notifications_count=unread_notifications_count,
        alerts=alerts,
    )


async def build_employee_dashboard(
    session: AsyncSession, company_id: uuid.UUID, user_id: uuid.UUID, include_wallets: bool
) -> EmployeeDashboardResponse:
    entries = await entry_repository.list_by_company(session, company_id)
    own_entries_today = sum(
        1 for entry in entries if entry.created_by_id == user_id and _is_today(entry.created_at)
    )

    transfers = await transfer_repository.list_for_company(session, company_id)
    own_transfers_today = sum(
        1 for transfer in transfers if transfer.created_by_id == user_id and _is_today(transfer.created_at)
    )
    own_pending_transfers = sum(
        1
        for transfer in transfers
        if transfer.created_by_id == user_id and transfer.status == TransferStatus.PENDING
    )

    payments = await payment_repository.list_for_company(session, company_id)
    own_payments_today = sum(
        1 for payment in payments if payment.created_by_id == user_id and _is_today(payment.created_at)
    )
    own_pending_payments = sum(
        1 for payment in payments if payment.created_by_id == user_id and payment.status == PaymentStatus.PENDING
    )

    wallets_count = 0
    if include_wallets:
        wallets = await wallet_repository.list_by_company(session, company_id)
        wallets_count = len(wallets)

    return EmployeeDashboardResponse(
        entries_created_today_count=own_entries_today,
        transfers_initiated_today_count=own_transfers_today,
        payments_initiated_today_count=own_payments_today,
        own_pending_transfers_count=own_pending_transfers,
        own_pending_payments_count=own_pending_payments,
        wallets_count=wallets_count,
    )


async def build_daily_report(session: AsyncSession, company_id: uuid.UUID, report_date) -> DailyReportResponse:
    # Agrégats calculés directement en SQL (COUNT/SUM/GROUP BY) plutôt qu'en chargeant tout
    # l'historique de l'entreprise pour compter en Python — ne scale pas avec des années
    # d'historique sinon.
    operation_counts = await national_operation_repository.count_by_type_in_period(
        session, company_id, report_date, report_date
    )
    entries_count, entries_total_by_currency = await entry_repository.aggregate_in_period(
        session, company_id, report_date, report_date
    )
    transfer_counts = await transfer_repository.count_by_status_in_period(
        session, company_id, report_date, report_date
    )
    payment_counts = await payment_repository.count_by_status_in_period(
        session, company_id, report_date, report_date
    )

    return DailyReportResponse(
        date=report_date.isoformat(),
        deposits_count=operation_counts.get(NationalOperationType.DEPOSIT.value, 0),
        withdrawals_count=operation_counts.get(NationalOperationType.WITHDRAWAL.value, 0),
        exchanges_count=operation_counts.get(NationalOperationType.EXCHANGE.value, 0),
        rebalances_count=operation_counts.get(NationalOperationType.REBALANCE.value, 0),
        entries_count=entries_count,
        entries_total_by_currency=entries_total_by_currency,
        transfers_created_count=sum(transfer_counts.values()),
        transfers_approved_count=transfer_counts.get(TransferStatus.APPROVED.value, 0),
        transfers_rejected_count=transfer_counts.get(TransferStatus.REJECTED.value, 0),
        payments_created_count=sum(payment_counts.values()),
        payments_approved_count=payment_counts.get(PaymentStatus.APPROVED.value, 0),
        payments_rejected_count=payment_counts.get(PaymentStatus.REJECTED.value, 0),
    )


def _daily_report_rows(report: DailyReportResponse) -> list[tuple[str, str]]:
    rows = [
        ("date", report.date),
        ("deposits_count", str(report.deposits_count)),
        ("withdrawals_count", str(report.withdrawals_count)),
        ("exchanges_count", str(report.exchanges_count)),
        ("rebalances_count", str(report.rebalances_count)),
        ("entries_count", str(report.entries_count)),
    ]
    for currency, amount in report.entries_total_by_currency.items():
        rows.append((f"entries_total_{currency}", str(amount)))
    rows.extend(
        [
            ("transfers_created_count", str(report.transfers_created_count)),
            ("transfers_approved_count", str(report.transfers_approved_count)),
            ("transfers_rejected_count", str(report.transfers_rejected_count)),
            ("payments_created_count", str(report.payments_created_count)),
            ("payments_approved_count", str(report.payments_approved_count)),
            ("payments_rejected_count", str(report.payments_rejected_count)),
        ]
    )
    return rows


def daily_report_to_csv(report: DailyReportResponse) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["metric", "value"])
    writer.writerows(_daily_report_rows(report))
    return buffer.getvalue()


def daily_report_to_pdf(report: DailyReportResponse) -> bytes:
    return pdf_export.key_value_to_pdf(f"Rapport journalier — {report.date}", _daily_report_rows(report))
