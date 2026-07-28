import "server-only";

import { serverFetch } from "@/lib/api";
import type {
  AuditLogEntry,
  ClientMovementReportRow,
  CollaboratorBalanceSummary,
  DailyReport,
  EmployeeActivityRow,
  FeeReportRow,
  MonthlyReport,
  Page,
  RejectedOperationReportRow,
  SupplierMovementReportRow,
  TransactionReportRow,
  WalletMovementReportRow,
} from "@/types/api";

const DEFAULT_REPORT_PAGE_SIZE = 20;

function periodQuery(
  dateFrom?: string,
  dateTo?: string,
  page: number = 1,
  pageSize: number = DEFAULT_REPORT_PAGE_SIZE
): string {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return `?${params.toString()}`;
}

export async function getDailyReport(date?: string): Promise<DailyReport> {
  const query = date ? `?date=${date}` : "";
  return serverFetch<DailyReport>(`/api/v1/reports/daily${query}`);
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  return serverFetch<MonthlyReport>(`/api/v1/reports/monthly?year=${year}&month=${month}`);
}

export async function listTransactionsReport(
  dateFrom?: string,
  dateTo?: string,
  page?: number
): Promise<Page<TransactionReportRow>> {
  return serverFetch<Page<TransactionReportRow>>(`/api/v1/reports/transactions${periodQuery(dateFrom, dateTo, page)}`);
}

export async function listCollaboratorBalancesReport(): Promise<CollaboratorBalanceSummary[]> {
  return serverFetch<CollaboratorBalanceSummary[]>("/api/v1/reports/collaborator-balances");
}

export async function listWalletHistoryReport(
  walletId: string,
  dateFrom?: string,
  dateTo?: string,
  page?: number
): Promise<Page<WalletMovementReportRow>> {
  return serverFetch<Page<WalletMovementReportRow>>(
    `/api/v1/reports/wallets/${walletId}/history${periodQuery(dateFrom, dateTo, page)}`
  );
}

export async function listEmployeeActivityReport(
  userId: string,
  dateFrom?: string,
  dateTo?: string,
  page?: number
): Promise<Page<EmployeeActivityRow>> {
  return serverFetch<Page<EmployeeActivityRow>>(
    `/api/v1/reports/employees/${userId}/activity${periodQuery(dateFrom, dateTo, page)}`
  );
}

export async function listSuppliersReport(
  dateFrom?: string,
  dateTo?: string,
  page?: number
): Promise<Page<SupplierMovementReportRow>> {
  return serverFetch<Page<SupplierMovementReportRow>>(
    `/api/v1/reports/suppliers${periodQuery(dateFrom, dateTo, page)}`
  );
}

export async function listClientsReport(
  dateFrom?: string,
  dateTo?: string,
  page?: number
): Promise<Page<ClientMovementReportRow>> {
  return serverFetch<Page<ClientMovementReportRow>>(`/api/v1/reports/clients${periodQuery(dateFrom, dateTo, page)}`);
}

export async function listFeesReport(dateFrom?: string, dateTo?: string, page?: number): Promise<Page<FeeReportRow>> {
  return serverFetch<Page<FeeReportRow>>(`/api/v1/reports/fees${periodQuery(dateFrom, dateTo, page)}`);
}

export async function listRejectedOperationsReport(
  dateFrom?: string,
  dateTo?: string,
  page?: number
): Promise<Page<RejectedOperationReportRow>> {
  return serverFetch<Page<RejectedOperationReportRow>>(
    `/api/v1/reports/rejected-operations${periodQuery(dateFrom, dateTo, page)}`
  );
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  return serverFetch<AuditLogEntry[]>("/api/v1/audit-logs");
}
