import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { listSuppliersPage } from "@/lib/data/suppliers";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableSearchForm } from "@/components/data-table/search-form";
import { SortableHeader } from "@/components/data-table/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateSupplierDialog } from "./create-supplier-dialog";
import { getCompanyMe } from "@/lib/data/company";

export const metadata: Metadata = { title: "Fournisseurs — D-Transfert" };

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [suppliersPage, company] = await Promise.all([
    listSuppliersPage({ page, search, sortBy, sortDir }),
    getCompanyMe(),
  ]);
  const suppliers = suppliersPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fournisseurs"
        description="Fournisseurs et suivi de leurs dettes/paiements."
        action={<CreateSupplierDialog defaultCurrency={company.default_currency} />}
      />

      {suppliersPage.total === 0 && !search ? (
        <EmptyState
          message="Aucun fournisseur enregistré."
          action={<CreateSupplierDialog defaultCurrency={company.default_currency} />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm defaultValue={search} sortBy={sortBy} sortDir={sortDir} placeholder="Rechercher un fournisseur…" />
          <Card className="py-0">
            {suppliers.length === 0 ? (
              <EmptyState message="Aucun fournisseur ne correspond à cette recherche." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader column="name" label="Nom" currentSort={sortBy} currentDir={sortDir} search={search} />
                    <TableHead>Code</TableHead>
                    <SortableHeader
                      column="balance"
                      label="Solde"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                      className="text-right"
                    />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        <Link href={`/suppliers/${supplier.id}`} className="hover:underline">
                          {supplier.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{supplier.code}</TableCell>
                      <TableCell
                        className={`text-right font-medium tabular-nums ${
                          Number(supplier.balance) < 0 ? "text-destructive" : ""
                        }`}
                      >
                        {formatMoney(supplier.balance, supplier.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/suppliers/${supplier.id}`}>
                            Voir
                            <ArrowRightIcon />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={suppliersPage.page}
              pageSize={suppliersPage.page_size}
              total={suppliersPage.total}
              search={search}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
