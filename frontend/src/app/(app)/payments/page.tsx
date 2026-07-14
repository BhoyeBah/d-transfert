import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Clock, HandCoins, Wallet } from "lucide-react";

import { ApiError } from "@/lib/api-error";
import { listCollaborations } from "@/lib/data/collaborations";
import { listClients } from "@/lib/data/clients";
import { listEntries } from "@/lib/data/entries";
import { getMe } from "@/lib/data/me";
import { listPayments, listPaymentsPage } from "@/lib/data/payments";
import { listWallets } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate, formatMoney } from "@/lib/format";
import { hasPermission, PermissionCode } from "@/lib/permissions";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CreatePaymentDialog } from "./create-payment-dialog";
import { CancelPaymentButton, PaymentDecisionButtons } from "./[paymentId]/payment-decision-buttons";

export const metadata: Metadata = { title: "Paiements client — D-Transfert" };

// Cette page est accessible avec la permission payment.create OU operation.validate, mais
// collaborations/clients/entrées/wallets exigent chacun leur propre permission distincte que
// tous les utilisateurs autorisés à voir cette page n'ont pas forcément — elles ne servent
// qu'aux fonctionnalités de création/approbation, donc on dégrade en liste vide plutôt que de
// faire planter la page entière.
async function orEmptyOn403<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return [];
    throw error;
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams & { entry?: string }>;
}) {
  const rawParams = await searchParams;
  const { page, search, sortBy, sortDir } = parseDataTableParams(rawParams);
  const [paymentsPage, allPayments, collaborations, clients, entries, wallets, me] = await Promise.all([
    listPaymentsPage({ page, search, sortBy, sortDir }),
    listPayments(),
    orEmptyOn403(listCollaborations()),
    orEmptyOn403(listClients()),
    orEmptyOn403(listEntries()),
    orEmptyOn403(listWallets()),
    getMe(),
  ]);
  const payments = paymentsPage.items;
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const entryReferenceById = new Map(entries.map((entry) => [entry.id, entry.reference]));
  const walletNameById = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const initialEntryId = rawParams.entry ?? null;
  const pendingCount = allPayments.filter((payment) => payment.status === "pending").length;
  const withEntryCount = allPayments.filter((payment) => payment.entry_id !== null).length;
  const directCount = allPayments.filter((payment) => payment.wallet_id !== null).length;
  // Ne pas proposer un lien vers un wallet si l'utilisateur n'a pas la permission de le
  // consulter — le clic mènerait systématiquement à une erreur de permission.
  const canViewWallets = hasPermission(me.permissions, me.is_owner, me.is_super_admin, PermissionCode.WALLET_MANAGE);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paiements client"
        description="Règlement d'une dette client, via une entrée ou un wallet."
        action={
          <CreatePaymentDialog
            collaborations={acceptedCollaborations}
            entries={entries}
            wallets={wallets}
            initialEntryId={initialEntryId}
            initialOpen={Boolean(initialEntryId)}
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Paiements total" value={paymentsPage.total} icon={HandCoins} />
        <StatTile
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatTile label="Via entrée" value={withEntryCount} icon={Wallet} hint="Entrée associée" />
        <StatTile label="Directs" value={directCount} icon={Wallet} hint="Paiement hors entrée" />
      </section>

      {paymentsPage.total === 0 && !search ? (
        <EmptyState message="Aucun paiement enregistré." />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm
            defaultValue={search}
            sortBy={sortBy}
            sortDir={sortDir}
            placeholder="Rechercher un paiement…"
          />
          <Card className="py-0">
            {payments.length === 0 ? (
              <EmptyState message="Aucun paiement ne correspond à cette recherche." />
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
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <SortableHeader
                      column="amount"
                      label="Montant"
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const isCounterparty = payment.company_id !== me.company_id;
                    const isPending = payment.status === "pending";
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">
                          <Link href={`/payments/${payment.id}`} className="hover:underline">
                            {payment.reference}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.entry_id ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit">
                                Via entrée
                              </Badge>
                              <Link
                                href={`/entries/${payment.entry_id}`}
                                className="font-medium text-foreground hover:underline"
                              >
                                {entryReferenceById.get(payment.entry_id) ?? payment.entry_id.slice(0, 8)}
                              </Link>
                            </div>
                          ) : payment.wallet_id ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="w-fit">
                                Wallet
                              </Badge>
                              {canViewWallets ? (
                                <Link
                                  href={`/wallets/${payment.wallet_id}`}
                                  className="font-medium text-foreground hover:underline"
                                >
                                  {walletNameById.get(payment.wallet_id) ?? payment.wallet_id.slice(0, 8)}
                                </Link>
                              ) : (
                                <span className="font-medium text-foreground">
                                  {walletNameById.get(payment.wallet_id) ?? payment.wallet_id.slice(0, 8)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="secondary" className="w-fit">
                              Direct
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.client_id
                            ? clientById.get(payment.client_id)?.name ?? payment.client_name ?? "—"
                            : payment.client_name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoney(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/payments/${payment.id}`}>
                                Voir
                                <ArrowRightIcon />
                              </Link>
                            </Button>
                            {isPending && isCounterparty && <PaymentDecisionButtons paymentId={payment.id} />}
                            {isPending && !isCounterparty && <CancelPaymentButton paymentId={payment.id} />}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={paymentsPage.page}
              pageSize={paymentsPage.page_size}
              total={paymentsPage.total}
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
