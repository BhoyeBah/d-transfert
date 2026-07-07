import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listEntries } from "@/lib/data/entries";
import { getMe } from "@/lib/data/me";
import { listTransfers } from "@/lib/data/transfers";
import { formatDate } from "@/lib/format";
import { sendModeLabels } from "@/lib/validation/transfers";
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
import { CreateTransferDialog } from "./create-transfer-dialog";
import { CancelTransferButton, TransferDecisionButtons } from "./[transferId]/transfer-decision-buttons";

export const metadata: Metadata = { title: "Envois internationaux — D-Transfert" };

export default async function TransfersPage() {
  const [transfers, collaborations, entries, me] = await Promise.all([
    listTransfers(),
    listCollaborations(),
    listEntries(),
    getMe(),
  ]);
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const collaborationsById = new Map(collaborations.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Envois internationaux"
        description="Transferts vers un collaborateur, avec ou sans entrée associée."
        action={<CreateTransferDialog collaborations={acceptedCollaborations} entries={entries} />}
      />

      {transfers.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Aucun envoi"
          message="Créez un envoi vers un collaborateur, à partir d'une entrée ou directement."
          action={<CreateTransferDialog collaborations={acceptedCollaborations} entries={entries} />}
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Collaborateur</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => {
                const collaboration = collaborationsById.get(transfer.collaboration_id);
                const isPending = transfer.status === "pending";
                const awaitingMe = isPending && transfer.company_id !== me.company_id;
                const canCancel = isPending && transfer.company_id === me.company_id;
                return (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/transfers/${transfer.id}`} className="hover:underline">
                        {transfer.reference}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{collaboration?.counterparty_company_name ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {transfer.beneficiary_name ?? transfer.beneficiary_phone}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sendModeLabels[transfer.send_mode]}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={transfer.status} />
                        {awaitingMe && (
                          <span className="text-xs font-medium text-pending">À valider</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AmountDisplay value={transfer.amount} currency={transfer.currency} size="sm" />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(transfer.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {awaitingMe && <TransferDecisionButtons transferId={transfer.id} />}
                        {canCancel && <CancelTransferButton transferId={transfer.id} />}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/transfers/${transfer.id}`}>Voir</Link>
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
