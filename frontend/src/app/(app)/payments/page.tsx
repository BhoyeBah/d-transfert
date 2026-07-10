import type { Metadata } from "next";
import Link from "next/link";
import { HandCoins } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listEntries } from "@/lib/data/entries";
import { getMe } from "@/lib/data/me";
import { listPaymentsPage } from "@/lib/data/payments";
import { listWallets } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate } from "@/lib/format";
import { AmountDisplay } from "@/components/amount-display";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
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
import { CreatePaymentDialog } from "./create-payment-dialog";
import { CancelPaymentButton, PaymentDecisionButtons } from "./[paymentId]/payment-decision-buttons";

export const metadata: Metadata = { title: "Paiements collaborateurs — D-Transfert" };

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [paymentsPage, collaborations, entries, wallets, me] = await Promise.all([
    listPaymentsPage({ page, search, sortBy, sortDir }),
    listCollaborations(),
    listEntries(),
    listWallets(),
    getMe(),
  ]);
  const payments = paymentsPage.items;
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const collaborationsById = new Map(collaborations.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paiements collaborateurs"
        description="Règlement d'une dette entre collaborateurs, via une entrée ou un wallet."
        action={
          <CreatePaymentDialog collaborations={acceptedCollaborations} entries={entries} wallets={wallets} />
        }
      />

      {paymentsPage.total === 0 && !search ? (
        <EmptyState
          icon={HandCoins}
          title="Aucun paiement"
          message="Réglez une dette envers un collaborateur, à partir d'une entrée, d'un wallet, ou directement."
          action={
            <CreatePaymentDialog collaborations={acceptedCollaborations} entries={entries} wallets={wallets} />
          }
        />
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
                    <SortableHeader column="reference" label="Référence" currentSort={sortBy} currentDir={sortDir} search={search} />
                    <TableHead>Collaborateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <SortableHeader
                      column="amount"
                      label="Montant"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                      className="text-right"
                    />
                    <SortableHeader column="created_at" label="Date" currentSort={sortBy} currentDir={sortDir} search={search} />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const collaboration = collaborationsById.get(payment.collaboration_id);
                    const isPending = payment.status === "pending";
                    const awaitingMe = isPending && payment.company_id !== me.company_id;
                    const canCancel = isPending && payment.company_id === me.company_id;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">
                          <Link href={`/payments/${payment.id}`} className="hover:underline">
                            {payment.reference}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{collaboration?.counterparty_company_name ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={payment.status} />
                            {awaitingMe && (
                              <span className="text-xs font-medium text-pending">À valider</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <AmountDisplay value={payment.amount} currency={payment.currency} size="sm" />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {awaitingMe && <PaymentDecisionButtons paymentId={payment.id} />}
                            {canCancel && <CancelPaymentButton paymentId={payment.id} />}
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/payments/${payment.id}`}>Voir</Link>
                            </Button>
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
