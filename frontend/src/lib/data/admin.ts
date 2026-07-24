import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type {
  AdminBackup,
  AdminCompanyDetail,
  AdminPlatformStats,
  AdminUser,
  AuditLogEntry,
  CompanyMe,
  Page,
  PlatformSettings,
  Subscription,
  SystemLogEntry,
} from "@/types/api";

function pageQuery(params: DataTableParams): string {
  return buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
}

export async function listAdminCompanies(): Promise<CompanyMe[]> {
  return serverFetch<CompanyMe[]>("/api/v1/admin/companies");
}

export async function listAdminCompaniesPage(params: DataTableParams): Promise<Page<CompanyMe>> {
  return serverFetch<Page<CompanyMe>>(`/api/v1/admin/companies/page${pageQuery(params)}`);
}

export async function listAdminAuditLogs(): Promise<AuditLogEntry[]> {
  return serverFetch<AuditLogEntry[]>("/api/v1/admin/audit-logs");
}

export async function listAdminAuditLogsPage(params: DataTableParams): Promise<Page<AuditLogEntry>> {
  return serverFetch<Page<AuditLogEntry>>(`/api/v1/admin/audit-logs/page${pageQuery(params)}`);
}

export async function getAdminStats(): Promise<AdminPlatformStats> {
  return serverFetch<AdminPlatformStats>("/api/v1/admin/stats");
}

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail> {
  return serverFetch<AdminCompanyDetail>(`/api/v1/admin/companies/${companyId}`);
}

export async function listAdminCompanyUsers(companyId: string): Promise<AdminUser[]> {
  return serverFetch<AdminUser[]>(`/api/v1/admin/companies/${companyId}/users`);
}

export async function listAdminSystemLogs(): Promise<SystemLogEntry[]> {
  return serverFetch<SystemLogEntry[]>("/api/v1/admin/system-logs");
}

export async function listAdminSystemLogsPage(params: DataTableParams): Promise<Page<SystemLogEntry>> {
  return serverFetch<Page<SystemLogEntry>>(`/api/v1/admin/system-logs/page${pageQuery(params)}`);
}

export async function getAdminSettings(): Promise<PlatformSettings> {
  return serverFetch<PlatformSettings>("/api/v1/admin/settings");
}

export async function listAdminBackups(): Promise<AdminBackup[]> {
  return serverFetch<AdminBackup[]>("/api/v1/admin/backups");
}

export async function getAdminSubscription(companyId: string): Promise<Subscription> {
  return serverFetch<Subscription>(`/api/v1/admin/companies/${companyId}/subscription`);
}

export async function listPlatformAdmins(): Promise<AdminUser[]> {
  return serverFetch<AdminUser[]>("/api/v1/admin/platform-admins");
}

export async function listPlatformAdminsPage(params: DataTableParams): Promise<Page<AdminUser>> {
  return serverFetch<Page<AdminUser>>(`/api/v1/admin/platform-admins/page${pageQuery(params)}`);
}
