import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { Entry, Page } from "@/types/api";

export async function listEntries(): Promise<Entry[]> {
  return serverFetch<Entry[]>("/api/v1/entries");
}

export async function listEntriesPage(params: DataTableParams): Promise<Page<Entry>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Entry>>(`/api/v1/entries/page${query}`);
}

export async function getEntry(entryId: string): Promise<Entry> {
  return serverFetch<Entry>(`/api/v1/entries/${entryId}`);
}
