import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ClockIcon } from "lucide-react";

import { uploadTransferProofAction } from "@/actions/transfers";
import { getCollaboration } from "@/lib/data/collaborations";
import { getMe } from "@/lib/data/me";
import { getTransfer, getTransferStatusHistory, listTransferProofs } from "@/lib/data/transfers";
import { listWallets } from "@/lib/data/wallets";
import { formatDate } from "@/lib/format";
import { sendModeLabels } from "@/lib/validation/transfers";
import { AmountDisplay } from "@/components/amount-display";
import { EmptyState } from "@/components/empty-state";
import { ProofsCard } from "@/components/proofs-card";
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
import { CancelTransferButton, TransferDecisionButtons } from "./transfer-decision-buttons";

export const metadata: Metadata = { title: "Détail envoi — D-Transfert" };

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ transferId: string }>;
}) {
  const { transferId } = await params;
  const [transfer, history, proofs, me, wallets] = await Promise.all([
    getTransfer(transferId),
    getTransferStatusHistory(transferId),
    listTransferProofs(transferId),
    getMe(),
    listWallets(),
  ]);
  const collaboration = await getCollaboration(transfer.collaboration_id);

  const isCounterparty = transfer.company_id !== me.company_id;
  const isPending = transfer.status === "pending";
  const canDecide = isPending && isCounterparty;
  const awaitingOtherParty = isPending && !isCounterparty;
  const canSeePrivateRate = transfer.company_id === me.company_id;
  const walletsForApproval = wallets.filter(
    (wallet) => wallet.currency === collaboration.currency && wallet.status === "active"
  );
  const usedWallet = transfer.wallet_id ? wallets.find((wallet) => wallet.id === transfer.wallet_id) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/transfers"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Envois internationaux
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl font-semibold tracking-tight">{transfer.reference}</h1>
            <p className="text-sm text-muted-foreground">
              Vers {collaboration.counterparty_company_name} · {transfer.beneficiary_name ?? transfer.beneficiary_phone} ·{" "}
              {formatDate(transfer.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={transfer.status} />
            {canDecide && (
              <TransferDecisionButtons transferId={transfer.id} wallets={walletsForApproval} />
            )}
            {awaitingOtherParty && (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockIcon className="size-3.5" />
                  En attente de validation par l&apos;autre partie
                </span>
                <CancelTransferButton transferId={transfer.id} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {transfer.entry_id && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Entrée source</span>
                <Link href={`/entries/${transfer.entry_id}`} className="font-medium hover:underline">
                  {transfer.entry_id.slice(0, 8)}
                </Link>
              </div>
            )}
            {transfer.client_id && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Client</span>
                <Link href={`/clients/${transfer.client_id}`} className="font-medium hover:underline">
                  {transfer.client_id.slice(0, 8)}
                </Link>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <AmountDisplay value={transfer.amount} currency={transfer.currency} size="md" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant converti</span>
              <AmountDisplay value={transfer.converted_amount} currency={collaboration.currency} size="md" />
            </div>
            {canSeePrivateRate && transfer.private_rate_used && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taux d&apos;envoi utilisé (conversion)</span>
                <span className="tabular-nums">{transfer.private_rate_used}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux collaboratif (référence)</span>
              <span className="tabular-nums">{transfer.collaborative_rate_used}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode d&apos;envoi</span>
              <span>{sendModeLabels[transfer.send_mode]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bénéficiaire</span>
              <span>{transfer.beneficiary_phone}</span>
            </div>
            {usedWallet && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet utilisé</span>
                <Link href={`/wallets/${usedWallet.id}`} className="font-medium hover:underline">
                  {usedWallet.name}
                </Link>
              </div>
            )}
            {transfer.client_debt_amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dette client (manquant)</span>
                <AmountDisplay value={`-${transfer.client_debt_amount}`} currency={transfer.currency} size="md" signed />
              </div>
            )}
            {transfer.rejection_reason && (
              <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-destructive">
                Motif de rejet : {transfer.rejection_reason}
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

      <ProofsCard
        proofs={proofs}
        fileHrefBase={`/api/transfers/${transfer.id}/proofs`}
        uploadAction={uploadTransferProofAction.bind(null, transfer.id)}
      />
    </div>
  );
}
