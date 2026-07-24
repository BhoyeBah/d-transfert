import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { Page, Wallet, WalletMovement, WalletOption } from "@/types/api";

export async function listWallets(): Promise<Wallet[]> {
  return serverFetch<Wallet[]>("/api/v1/wallets");
}

export async function listWalletOptions(): Promise<WalletOption[]> {
  return serverFetch<WalletOption[]>("/api/v1/wallets/options");
}

export async function listWalletsPage(params: DataTableParams): Promise<Page<Wallet>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Wallet>>(`/api/v1/wallets/page${query}`);
}

export async function getWallet(walletId: string): Promise<Wallet> {
  return serverFetch<Wallet>(`/api/v1/wallets/${walletId}`);
}

export async function listWalletMovements(walletId: string): Promise<WalletMovement[]> {
  return serverFetch<WalletMovement[]>(`/api/v1/wallets/${walletId}/movements`);
}
