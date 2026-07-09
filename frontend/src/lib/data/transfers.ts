import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { Page, Proof, Transfer, TransferStatusHistoryEntry } from "@/types/api";

export async function listTransfers(): Promise<Transfer[]> {
  return serverFetch<Transfer[]>("/api/v1/transfers");
}

export async function listTransfersPage(params: DataTableParams): Promise<Page<Transfer>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Transfer>>(`/api/v1/transfers/page${query}`);
}

export async function getTransfer(transferId: string): Promise<Transfer> {
  return serverFetch<Transfer>(`/api/v1/transfers/${transferId}`);
}

export async function getTransferStatusHistory(transferId: string): Promise<TransferStatusHistoryEntry[]> {
  return serverFetch<TransferStatusHistoryEntry[]>(`/api/v1/transfers/${transferId}/status-history`);
}

export async function listTransferProofs(transferId: string): Promise<Proof[]> {
  return serverFetch<Proof[]>(`/api/v1/transfers/${transferId}/proofs`);
}
