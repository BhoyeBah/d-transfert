import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { Employee, Page } from "@/types/api";

export async function listEmployees(): Promise<Employee[]> {
  return serverFetch<Employee[]>("/api/v1/employees");
}

export async function listEmployeesPage(params: DataTableParams): Promise<Page<Employee>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Employee>>(`/api/v1/employees/page${query}`);
}
