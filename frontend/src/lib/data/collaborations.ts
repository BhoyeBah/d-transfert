import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type {
  Collaboration,
  CollaborationRateHistoryEntry,
  CollaboratorBalance,
  Page,
  PrivateRate,
} from "@/types/api";

export async function listCollaborations(): Promise<Collaboration[]> {
  return serverFetch<Collaboration[]>("/api/v1/collaborations");
}

export async function listCollaborationsPage(params: DataTableParams): Promise<Page<Collaboration>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Collaboration>>(`/api/v1/collaborations/page${query}`);
}

export async function getCollaboration(collaborationId: string): Promise<Collaboration> {
  return serverFetch<Collaboration>(`/api/v1/collaborations/${collaborationId}`);
}

export async function getRateHistory(collaborationId: string): Promise<CollaborationRateHistoryEntry[]> {
  return serverFetch<CollaborationRateHistoryEntry[]>(`/api/v1/collaborations/${collaborationId}/rate-history`);
}

export async function getCollaboratorBalance(collaborationId: string): Promise<CollaboratorBalance> {
  return serverFetch<CollaboratorBalance>(`/api/v1/collaborations/${collaborationId}/balance`);
}

export async function listPrivateRates(): Promise<PrivateRate[]> {
  return serverFetch<PrivateRate[]>("/api/v1/private-rates");
}
