import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { NationalOperation, Page } from "@/types/api";

export async function listNationalOperations(): Promise<NationalOperation[]> {
  return serverFetch<NationalOperation[]>("/api/v1/national-operations");
}

export async function listNationalOperationsPage(params: DataTableParams): Promise<Page<NationalOperation>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<NationalOperation>>(`/api/v1/national-operations/page${query}`);
}

export async function getNationalOperation(operationId: string): Promise<NationalOperation> {
  return serverFetch<NationalOperation>(`/api/v1/national-operations/${operationId}`);
}
