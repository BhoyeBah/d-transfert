import type { Metadata } from "next";
import Link from "next/link";

import { listNationalOperationsPage } from "@/lib/data/national-operations";
import { listWallets } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate, formatMoney } from "@/lib/format";
import { nationalOperationTypeLabels } from "@/lib/validation/national-operations";
import type { NationalOperation } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
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
import { CreateOperationDialog } from "./create-operation-dialog";
import { OperationRowActions } from "./operation-row-actions";

export const metadata: Metadata = { title: "Opérations nationales — D-Transfert" };

function operationAmountByCurrency(operation: NationalOperation): string {
  const totals = new Map<string, number>();
  for (const line of operation.lines) {
    const amountIn = Number(line.amount_in);
    if (amountIn > 0) {
      totals.set(line.currency, (totals.get(line.currency) ?? 0) + amountIn);
    }
  }
  if (totals.size === 0) return "—";
  return Array.from(totals.entries())
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" · ");
}

export default async function NationalOperationsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [operationsPage, wallets] = await Promise.all([
    listNationalOperationsPage({ page, search, sortBy, sortDir }),
    listWallets(),
  ]);
  const operations = operationsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Opérations nationales"
        description="Dépôts, retraits, échanges et rééquilibrages entre wallets — sans frais."
        action={<CreateOperationDialog wallets={wallets} />}
      />

      {operationsPage.total === 0 && !search ? (
        <EmptyState
          message="Aucune opération enregistrée."
          action={<CreateOperationDialog wallets={wallets} />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm
            defaultValue={search}
            sortBy={sortBy}
            sortDir={sortDir}
            placeholder="Rechercher une opération…"
          />
          <Card className="py-0">
            {operations.length === 0 ? (
              <EmptyState message="Aucune opération ne correspond à cette recherche." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader
                      column="reference"
                      label="Référence"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Client (téléphone)</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <SortableHeader
                      column="created_at"
                      label="Date"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/national-operations/${operation.id}`} className="hover:underline">
                          {operation.reference}
                        </Link>
                      </TableCell>
                      <TableCell>{nationalOperationTypeLabels[operation.type as "deposit"] ?? operation.type}</TableCell>
                      <TableCell>
                        <StatusBadge status={operation.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {operation.client_name ? (
                          <>
                            {operation.client_name}
                            {operation.client_phone && (
                              <span className="text-xs"> ({operation.client_phone})</span>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {operationAmountByCurrency(operation)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(operation.created_at)}
                      </TableCell>
                      <TableCell>
                        <OperationRowActions operationId={operation.id} status={operation.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={operationsPage.page}
              pageSize={operationsPage.page_size}
              total={operationsPage.total}
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
