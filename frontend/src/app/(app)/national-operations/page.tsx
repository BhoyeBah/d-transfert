import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Banknote, Wallet as WalletIcon, XCircle } from "lucide-react";

import { listNationalOperations, listNationalOperationsPage } from "@/lib/data/national-operations";
import { listWallets } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate, formatMoney } from "@/lib/format";
import { nationalOperationTypeLabels } from "@/lib/validation/national-operations";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatTile } from "@/components/stat-tile";
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
import { NationalOperationRowActions } from "./national-operation-row-actions";

export const metadata: Metadata = { title: "Opérations nationales — D-Transfert" };

export default async function NationalOperationsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [operationsPage, allOperations, wallets] = await Promise.all([
    listNationalOperationsPage({ page, search, sortBy, sortDir }),
    listNationalOperations(),
    listWallets(),
  ]);
  const operations = operationsPage.items;
  const depositCount = allOperations.filter((op) => op.type === "deposit").length;
  const withdrawalCount = allOperations.filter((op) => op.type === "withdrawal").length;
  const exchangeCount = allOperations.filter((op) => op.type === "exchange").length;
  const cancelledCount = allOperations.filter((op) => op.status === "cancelled").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Opérations nationales"
        description="Dépôts, retraits, échanges et rééquilibrages entre wallets — sans frais."
        action={<CreateOperationDialog wallets={wallets} />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Dépôts" value={depositCount} icon={Banknote} />
        <StatTile label="Retraits" value={withdrawalCount} icon={WalletIcon} />
        <StatTile label="Échanges" value={exchangeCount} icon={ArrowLeftRight} />
        <StatTile
          label="Annulées"
          value={cancelledCount}
          icon={XCircle}
          tone={cancelledCount > 0 ? "warning" : "default"}
        />
      </section>

      {operationsPage.total === 0 && !search ? (
        <EmptyState message="Aucune opération enregistrée." />
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
                  {operations.map((operation) => {
                    const primaryLine = operation.lines.find(
                      (line) => Number(line.amount_in) > 0 || Number(line.amount_out) > 0
                    );
                    const primaryAmount = primaryLine
                      ? Number(primaryLine.amount_in) > 0
                        ? primaryLine.amount_in
                        : primaryLine.amount_out
                      : null;

                    return (
                      <TableRow key={operation.id}>
                        <TableCell className="font-mono text-xs">
                          <Link href={`/national-operations/${operation.id}`} className="hover:underline">
                            {operation.reference}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {nationalOperationTypeLabels[operation.type as keyof typeof nationalOperationTypeLabels] ??
                            operation.type}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={operation.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {operation.client_name
                            ? `${operation.client_name}${operation.client_phone ? ` (${operation.client_phone})` : ""}`
                            : operation.client_phone ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {primaryLine ? formatMoney(primaryAmount ?? "0", primaryLine.currency) : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(operation.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <NationalOperationRowActions
                            operationId={operation.id}
                            canCancel={operation.status === "validated"}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
