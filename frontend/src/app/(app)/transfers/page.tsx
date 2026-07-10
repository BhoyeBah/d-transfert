import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Clock, HandCoins, Wallet } from "lucide-react";

import { listCollaborations, listPrivateRates } from "@/lib/data/collaborations";
import { listEntries } from "@/lib/data/entries";
import { listTransfers, listTransfersPage } from "@/lib/data/transfers";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate, formatMoney } from "@/lib/format";
import { sendModeLabels } from "@/lib/validation/transfers";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/stat-tile";
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
import { CreateTransferDialog } from "./create-transfer-dialog";

export const metadata: Metadata = { title: "Envois internationaux — D-Transfert" };

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams & { entry?: string }>;
}) {
  const rawParams = await searchParams;
  const { page, search, sortBy, sortDir } = parseDataTableParams(rawParams);
  const [transfersPage, allTransfers, collaborations, entries, privateRates] = await Promise.all([
    listTransfersPage({ page, search, sortBy, sortDir }),
    listTransfers(),
    listCollaborations(),
    listEntries(),
    listPrivateRates(),
  ]);
  const transfers = transfersPage.items;
  const entryReferenceById = new Map(entries.map((entry) => [entry.id, entry.reference]));
  const collaborationById = new Map(collaborations.map((collaboration) => [collaboration.id, collaboration]));
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const initialEntryId = rawParams.entry ?? null;
  const pendingCount = allTransfers.filter((transfer) => transfer.status === "pending").length;
  const withEntryCount = allTransfers.filter((transfer) => transfer.entry_id !== null).length;
  const clientDebtCount = allTransfers.filter((transfer) => transfer.client_debt_amount !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Envois internationaux"
        description="Transferts vers un collaborateur, avec ou sans entrée associée."
        action={
          <CreateTransferDialog
            collaborations={acceptedCollaborations}
            entries={entries}
            privateRates={privateRates}
            initialEntryId={initialEntryId}
            initialOpen={Boolean(initialEntryId)}
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Envois total" value={transfersPage.total} icon={ArrowLeftRight} />
        <StatTile
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Avec entrée"
          value={withEntryCount}
          icon={Wallet}
          hint="Source liée"
        />
        <StatTile
          label="Dette client"
          value={clientDebtCount}
          icon={HandCoins}
          tone={clientDebtCount > 0 ? "warning" : "success"}
        />
      </section>

      {transfersPage.total === 0 && !search ? (
        <EmptyState message="Aucun envoi enregistré." />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm
            defaultValue={search}
            sortBy={sortBy}
            sortDir={sortDir}
            placeholder="Rechercher un envoi…"
          />
          <Card className="py-0">
            {transfers.length === 0 ? (
              <EmptyState message="Aucun envoi ne correspond à cette recherche." />
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
                    <TableHead>Source</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Statut</TableHead>
                    <SortableHeader
                      column="amount"
                      label="Montant converti"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                      className="text-right"
                    />
                    <SortableHeader
                      column="created_at"
                      label="Date"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => {
                    const collaboration = collaborationById.get(transfer.collaboration_id);
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-mono text-xs">
                          <Link href={`/transfers/${transfer.id}`} className="hover:underline">
                            {transfer.reference}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {transfer.entry_id ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit">
                                Via entrée
                              </Badge>
                              <Link href={`/entries/${transfer.entry_id}`} className="font-medium text-foreground hover:underline">
                                {entryReferenceById.get(transfer.entry_id) ?? transfer.entry_id.slice(0, 8)}
                              </Link>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="w-fit">
                              Direct
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transfer.beneficiary_name ?? transfer.beneficiary_phone}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sendModeLabels[transfer.send_mode]}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={transfer.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {formatMoney(transfer.converted_amount, collaboration?.currency ?? transfer.currency)}
                            </span>
                            {collaboration && collaboration.currency !== transfer.currency && (
                              <span className="text-xs text-muted-foreground">
                                {formatMoney(transfer.amount, transfer.currency)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(transfer.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={transfersPage.page}
              pageSize={transfersPage.page_size}
              total={transfersPage.total}
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
