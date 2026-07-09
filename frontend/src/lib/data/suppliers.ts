import "server-only";

import { serverFetch } from "@/lib/api";
import { buildPageQuery, type DataTableParams } from "@/lib/data-table";
import type { Page, Supplier, SupplierBalanceMovement } from "@/types/api";

export async function listSuppliers(): Promise<Supplier[]> {
  return serverFetch<Supplier[]>("/api/v1/suppliers");
}

export async function listSuppliersPage(params: DataTableParams): Promise<Page<Supplier>> {
  const query = buildPageQuery({
    page: params.page,
    search: params.search,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
  });
  return serverFetch<Page<Supplier>>(`/api/v1/suppliers/page${query}`);
}

export async function getSupplier(supplierId: string): Promise<Supplier> {
  return serverFetch<Supplier>(`/api/v1/suppliers/${supplierId}`);
}

export async function listSupplierMovements(supplierId: string): Promise<SupplierBalanceMovement[]> {
  return serverFetch<SupplierBalanceMovement[]>(`/api/v1/suppliers/${supplierId}/movements`);
}
