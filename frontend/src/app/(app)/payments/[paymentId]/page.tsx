import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ApiError } from "@/lib/api-error";
import { getClient } from "@/lib/data/clients";
import { getMe } from "@/lib/data/me";
import { getPayment, getPaymentStatusHistory } from "@/lib/data/payments";
import { getWallet } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentDecisionButtons } from "./payment-decision-buttons";

export const metadata: Metadata = { title: "Détail paiement client — D-Transfert" };

// wallet.manage/client.manage ne sont pas garantis pour tous les utilisateurs pouvant voir un
// paiement (payment.create / operation.validate) — on dégrade en absence de détail plutôt que
// de faire planter la page.
async function orNullOn403<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  }
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const [payment, history, me] = await Promise.all([
    getPayment(paymentId),
    getPaymentStatusHistory(paymentId),
    getMe(),
  ]);
  const [wallet, client] = await Promise.all([
    payment.wallet_id ? orNullOn403(getWallet(payment.wallet_id)) : Promise.resolve(null),
    payment.client_id ? orNullOn403(getClient(payment.client_id)) : Promise.resolve(null),
  ]);

  const isCounterparty = payment.company_id !== me.company_id;
  const canDecide = payment.status === "pending" && isCounterparty;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/payments"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Paiements client
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-lg font-semibold tracking-tight">{payment.reference}</h1>
            <p className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={payment.status} />
            {canDecide && <PaymentDecisionButtons paymentId={payment.id} />}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {payment.entry_id && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Entrée source</span>
                <Link href={`/entries/${payment.entry_id}`} className="font-medium hover:underline">
                  {payment.entry_id.slice(0, 8)}
                </Link>
              </div>
            )}
            {wallet && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Wallet source</span>
                <Link href={`/wallets/${wallet.id}`} className="font-medium hover:underline">
                  {wallet.name}
                </Link>
              </div>
            )}
            {client && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Client</span>
                <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                  {client.name}
                </Link>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium tabular-nums">{formatMoney(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant converti</span>
              <span className="font-medium tabular-nums">{payment.converted_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux utilisé</span>
              <span className="tabular-nums">{payment.collaborative_rate_used}</span>
            </div>
            {payment.client_debt_amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dette client (manquant)</span>
                <span className="font-medium tabular-nums text-destructive">
                  {formatMoney(payment.client_debt_amount, payment.currency)}
                </span>
              </div>
            )}
            {payment.rejection_reason && (
              <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-destructive">
                Motif de rejet : {payment.rejection_reason}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des statuts</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <EmptyState message="Aucun historique." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>De</TableHead>
                    <TableHead>Vers</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.old_status ? <StatusBadge status={entry.old_status} /> : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={entry.new_status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
