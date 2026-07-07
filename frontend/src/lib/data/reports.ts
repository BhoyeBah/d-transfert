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
  RejectedOperationReportRow,
  SupplierMovementReportRow,
  TransactionReportRow,
  WalletMovementReportRow,
} from "@/types/api";

function periodQuery(dateFrom?: string, dateTo?: string): string {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getDailyReport(date?: string): Promise<DailyReport> {
  const query = date ? `?date=${date}` : "";
  return serverFetch<DailyReport>(`/api/v1/reports/daily${query}`);
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  return serverFetch<MonthlyReport>(`/api/v1/reports/monthly?year=${year}&month=${month}`);
}

export async function listTransactionsReport(dateFrom?: string, dateTo?: string): Promise<TransactionReportRow[]> {
  return serverFetch<TransactionReportRow[]>(`/api/v1/reports/transactions${periodQuery(dateFrom, dateTo)}`);
}

export async function listCollaboratorBalancesReport(): Promise<CollaboratorBalanceSummary[]> {
  return serverFetch<CollaboratorBalanceSummary[]>("/api/v1/reports/collaborator-balances");
}

export async function listWalletHistoryReport(
  walletId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<WalletMovementReportRow[]> {
  return serverFetch<WalletMovementReportRow[]>(
    `/api/v1/reports/wallets/${walletId}/history${periodQuery(dateFrom, dateTo)}`
  );
}

export async function listEmployeeActivityReport(
  userId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<EmployeeActivityRow[]> {
  return serverFetch<EmployeeActivityRow[]>(
    `/api/v1/reports/employees/${userId}/activity${periodQuery(dateFrom, dateTo)}`
  );
}

export async function listSuppliersReport(dateFrom?: string, dateTo?: string): Promise<SupplierMovementReportRow[]> {
  return serverFetch<SupplierMovementReportRow[]>(`/api/v1/reports/suppliers${periodQuery(dateFrom, dateTo)}`);
}

export async function listClientsReport(dateFrom?: string, dateTo?: string): Promise<ClientMovementReportRow[]> {
  return serverFetch<ClientMovementReportRow[]>(`/api/v1/reports/clients${periodQuery(dateFrom, dateTo)}`);
}

export async function listFeesReport(dateFrom?: string, dateTo?: string): Promise<FeeReportRow[]> {
  return serverFetch<FeeReportRow[]>(`/api/v1/reports/fees${periodQuery(dateFrom, dateTo)}`);
}

export async function listRejectedOperationsReport(
  dateFrom?: string,
  dateTo?: string
): Promise<RejectedOperationReportRow[]> {
  return serverFetch<RejectedOperationReportRow[]>(
    `/api/v1/reports/rejected-operations${periodQuery(dateFrom, dateTo)}`
  );
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  return serverFetch<AuditLogEntry[]>("/api/v1/audit-logs");
}
