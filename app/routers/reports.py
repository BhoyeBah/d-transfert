import uuid
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.permission_codes import PermissionCode
from app.core.permissions import CurrentUser, get_company_scope, require_permission
from app.schemas.dashboard import CollaboratorBalanceSummary, DailyReportResponse
from app.schemas.pagination import Page
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
from app.services import dashboard_service, report_service

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])

_require_view = require_permission(PermissionCode.REPORT_VIEW)
_require_export = require_permission(PermissionCode.REPORT_EXPORT)

ExportFormat = Literal["csv", "pdf"]


def _csv_response(content: str, filename: str) -> PlainTextResponse:
    return PlainTextResponse(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


def _pdf_response(content: bytes, filename: str) -> Response:
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/daily", response_model=DailyReportResponse)
async def get_daily_report(
    report_date: date = Query(default=None, alias="date"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> DailyReportResponse:
    target_date = report_date or date.today()
    return await dashboard_service.build_daily_report(db, company_id, target_date)


@router.get("/daily/export")
@limiter.limit("20/minute")
async def export_daily_report_csv(
    request: Request,
    report_date: date = Query(default=None, alias="date"),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    target_date = report_date or date.today()
    report = await dashboard_service.build_daily_report(db, company_id, target_date)
    if format == "pdf":
        return _pdf_response(dashboard_service.daily_report_to_pdf(report), f"rapport-{target_date.isoformat()}.pdf")
    return _csv_response(dashboard_service.daily_report_to_csv(report), f"rapport-{target_date.isoformat()}.csv")


@router.get("/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> MonthlyReportResponse:
    return await report_service.build_monthly_report(db, company_id, year, month)


@router.get("/monthly/export")
@limiter.limit("20/minute")
async def export_monthly_report_csv(
    request: Request,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    report = await report_service.build_monthly_report(db, company_id, year, month)
    if format == "pdf":
        return _pdf_response(report_service.monthly_report_to_pdf(report), f"rapport-mensuel-{report.month}.pdf")
    return _csv_response(report_service.monthly_report_to_csv(report), f"rapport-mensuel-{report.month}.csv")


@router.get("/transactions", response_model=Page[TransactionReportRow])
async def get_transactions_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[TransactionReportRow]:
    rows, total = await report_service.build_transactions_report(
        db, company_id, date_from, date_to, page, page_size
    )
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/transactions/export")
@limiter.limit("20/minute")
async def export_transactions_report_csv(
    request: Request,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_transactions_report(db, company_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, TransactionReportRow, "Rapport des transactions"),
            "rapport-transactions.pdf",
        )
    return _csv_response(report_service.rows_to_csv(rows, TransactionReportRow), "rapport-transactions.csv")


@router.get("/collaborator-balances", response_model=list[CollaboratorBalanceSummary])
async def get_collaborator_balances_report(
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> list[CollaboratorBalanceSummary]:
    return await report_service.build_collaborator_balances_report(db, company_id)


@router.get("/collaborator-balances/export")
@limiter.limit("20/minute")
async def export_collaborator_balances_report_csv(
    request: Request,
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows = await report_service.build_collaborator_balances_report(db, company_id)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, CollaboratorBalanceSummary, "Solde par collaborateur"),
            "rapport-soldes-collaborateurs.pdf",
        )
    return _csv_response(
        report_service.rows_to_csv(rows, CollaboratorBalanceSummary), "rapport-soldes-collaborateurs.csv"
    )


@router.get("/wallets/{wallet_id}/history", response_model=Page[WalletMovementReportRow])
async def get_wallet_history_report(
    wallet_id: uuid.UUID,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[WalletMovementReportRow]:
    rows, total = await report_service.build_wallet_history_report(
        db, company_id, wallet_id, date_from, date_to, page, page_size
    )
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/wallets/{wallet_id}/history/export")
@limiter.limit("20/minute")
async def export_wallet_history_report_csv(
    request: Request,
    wallet_id: uuid.UUID,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_wallet_history_report(db, company_id, wallet_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, WalletMovementReportRow, "Historique d'un wallet"),
            f"rapport-wallet-{wallet_id}.pdf",
        )
    return _csv_response(report_service.rows_to_csv(rows, WalletMovementReportRow), f"rapport-wallet-{wallet_id}.csv")


@router.get("/employees/{user_id}/activity", response_model=Page[EmployeeActivityRow])
async def get_employee_activity_report(
    user_id: uuid.UUID,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[EmployeeActivityRow]:
    rows, total = await report_service.build_employee_activity_report(
        db, company_id, user_id, date_from, date_to, page, page_size
    )
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/employees/{user_id}/activity/export")
@limiter.limit("20/minute")
async def export_employee_activity_report_csv(
    request: Request,
    user_id: uuid.UUID,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_employee_activity_report(db, company_id, user_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, EmployeeActivityRow, "Activité par employé"),
            f"rapport-employe-{user_id}.pdf",
        )
    return _csv_response(report_service.rows_to_csv(rows, EmployeeActivityRow), f"rapport-employe-{user_id}.csv")


@router.get("/suppliers", response_model=Page[SupplierMovementReportRow])
async def get_suppliers_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[SupplierMovementReportRow]:
    rows, total = await report_service.build_supplier_report(db, company_id, date_from, date_to, page, page_size)
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/suppliers/export")
@limiter.limit("20/minute")
async def export_suppliers_report_csv(
    request: Request,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_supplier_report(db, company_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, SupplierMovementReportRow, "Rapport fournisseurs"),
            "rapport-fournisseurs.pdf",
        )
    return _csv_response(report_service.rows_to_csv(rows, SupplierMovementReportRow), "rapport-fournisseurs.csv")


@router.get("/clients", response_model=Page[ClientMovementReportRow])
async def get_clients_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[ClientMovementReportRow]:
    rows, total = await report_service.build_client_report(db, company_id, date_from, date_to, page, page_size)
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/clients/export")
@limiter.limit("20/minute")
async def export_clients_report_csv(
    request: Request,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_client_report(db, company_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, ClientMovementReportRow, "Rapport clients"), "rapport-clients.pdf"
        )
    return _csv_response(report_service.rows_to_csv(rows, ClientMovementReportRow), "rapport-clients.csv")


@router.get("/fees", response_model=Page[FeeReportRow])
async def get_fees_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[FeeReportRow]:
    rows, total = await report_service.build_fees_report(db, company_id, date_from, date_to, page, page_size)
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/fees/export")
@limiter.limit("20/minute")
async def export_fees_report_csv(
    request: Request,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_fees_report(db, company_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(report_service.rows_to_pdf(rows, FeeReportRow, "Rapport des frais"), "rapport-frais.pdf")
    return _csv_response(report_service.rows_to_csv(rows, FeeReportRow), "rapport-frais.csv")


@router.get("/rejected-operations", response_model=Page[RejectedOperationReportRow])
async def get_rejected_operations_report(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_view),
) -> Page[RejectedOperationReportRow]:
    rows, total = await report_service.build_rejected_operations_report(
        db, company_id, date_from, date_to, page, page_size
    )
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.get("/rejected-operations/export")
@limiter.limit("20/minute")
async def export_rejected_operations_report_csv(
    request: Request,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    format: ExportFormat = Query(default="csv"),
    company_id: uuid.UUID = Depends(get_company_scope),
    db: AsyncSession = Depends(get_db),
    _current_user: CurrentUser = Depends(_require_export),
) -> Response:
    rows, _ = await report_service.build_rejected_operations_report(db, company_id, date_from, date_to)
    if format == "pdf":
        return _pdf_response(
            report_service.rows_to_pdf(rows, RejectedOperationReportRow, "Opérations rejetées / annulées"),
            "rapport-operations-rejetees.pdf",
        )
    return _csv_response(
        report_service.rows_to_csv(rows, RejectedOperationReportRow), "rapport-operations-rejetees.csv"
    )
