import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { Client, ClientBalanceMovement, Page } from "@/types/api";

export async function listClients(): Promise<Client[]> {
  return serverFetch<Client[]>("/api/v1/clients");
}

export async function listClientsPage(params: DataTableParams): Promise<Page<Client>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Client>>(`/api/v1/clients/page${query}`);
}

export async function getClient(clientId: string): Promise<Client> {
  return serverFetch<Client>(`/api/v1/clients/${clientId}`);
}

export async function listClientMovements(clientId: string): Promise<ClientBalanceMovement[]> {
  return serverFetch<ClientBalanceMovement[]>(`/api/v1/clients/${clientId}/movements`);
}
