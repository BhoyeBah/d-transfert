import type { Metadata } from "next";
import Link from "next/link";
import { HandCoins } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listEntries } from "@/lib/data/entries";
import { getMe } from "@/lib/data/me";
import { listPayments } from "@/lib/data/payments";
import { listWallets } from "@/lib/data/wallets";
import { formatDate } from "@/lib/format";
import { AmountDisplay } from "@/components/amount-display";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default async function PaymentsPage() {
  const [payments, collaborations, entries, wallets, me] = await Promise.all([
    listPayments(),
    listCollaborations(),
    listEntries(),
    listWallets(),
    getMe(),
  ]);
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

      {payments.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Aucun paiement"
          message="Réglez une dette envers un collaborateur, à partir d'une entrée, d'un wallet, ou directement."
          action={
            <CreatePaymentDialog collaborations={acceptedCollaborations} entries={entries} wallets={wallets} />
          }
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Collaborateur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
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
        </Card>
      )}
    </div>
  );
}
