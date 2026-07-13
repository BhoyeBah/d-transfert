import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowLeftRight, HandCoins, Layers3 } from "lucide-react";

import { ApiError } from "@/lib/api-error";
import { getEntry, listEntries } from "@/lib/data/entries";
import { listWallets } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { MergeSameClientEntriesCard } from "@/components/merge-same-client-entries-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CancelEntryButton } from "./cancel-entry-button";

export const metadata: Metadata = { title: "Détail entrée — D-Transfert" };

const CANCELLABLE_STATUSES = new Set(["unallocated"]);

// wallet.manage n'est pas garanti pour tous les utilisateurs pouvant voir une entrée
// (transfer.create / payment.create / operation.validate) — le nom du wallet n'est qu'un
// affichage optionnel (déjà dégradé en identifiant brut ci-dessous), donc on dégrade en liste
// vide plutôt que de faire planter la page.
async function orEmptyOn403<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return [];
    throw error;
  }
}

export default async function EntryDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const [entry, allEntries, wallets] = await Promise.all([
    getEntry(entryId),
    listEntries(),
    orEmptyOn403(listWallets()),
  ]);
  const walletNameById = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));
  const sameClientEntries = allEntries.filter(
    (candidate) =>
      candidate.id !== entry.id &&
      candidate.merged_into_id === null &&
      (candidate.status === "unallocated" || candidate.status === "partially_allocated") &&
      candidate.client_name?.trim().toLowerCase() === entry.client_name?.trim().toLowerCase() &&
      candidate.client_phone?.trim() === entry.client_phone?.trim()
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4 rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur sm:p-6">
        <Link
          href="/entries"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Entrées
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Entrée enregistrée
            </div>
            <h1 className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">{entry.reference}</h1>
            <p className="text-sm text-muted-foreground">
              {entry.client_name ?? "Client non renseigné"} · {formatDate(entry.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            {CANCELLABLE_STATUSES.has(entry.status) && !entry.merged_into_id && (
              <CancelEntryButton entryId={entry.id} />
            )}
          </div>
        </div>

        {entry.status === "consumed" ? (
          <p className="text-sm text-muted-foreground">
            Entrée entièrement consommée — archivée, aucune action possible.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link href={`/transfers?entry=${entry.id}`}>
                <ArrowLeftRight />
                Transformer en envoi
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/payments?entry=${entry.id}`}>
                <HandCoins />
                Paiement client
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#merge-same-client">
                <Layers3 />
                Fusionner avec même client
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Lignes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {walletNameById.has(line.wallet_id) ? (
                        <Link href={`/wallets/${line.wallet_id}`} className="hover:underline">
                          {walletNameById.get(line.wallet_id)}
                        </Link>
                      ) : (
                        line.wallet_id.slice(0, 8)
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(line.amount, line.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(entry.available_by_currency).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun montant disponible.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.entries(entry.available_by_currency).map(([currency, amount]) => (
                  <div key={currency} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{currency}</span>
                    <span className="font-medium tabular-nums">{formatMoney(amount, currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Affectations</CardTitle>
        </CardHeader>
        <CardContent>
          {entry.allocations.length === 0 ? (
            <EmptyState message="Aucune affectation." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Montant affecté</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.allocations.map((allocation, index) => (
                  <TableRow key={index}>
                    <TableCell>{allocation.target_type === "transfer" ? "Envoi" : "Paiement client"}</TableCell>
                    <TableCell className="font-mono text-xs">{allocation.target_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(allocation.amount_allocated, allocation.currency)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(allocation.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {entry.status !== "consumed" && (
        <div id="merge-same-client">
          <MergeSameClientEntriesCard entry={entry} candidates={sameClientEntries} />
        </div>
      )}
    </div>
  );
}
