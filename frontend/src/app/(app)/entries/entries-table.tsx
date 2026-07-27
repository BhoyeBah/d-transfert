"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, HandCoins, EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { mergeEntriesAction } from "@/actions/entries";
import { formatDate, formatMoney } from "@/lib/format";
import type { SortDir } from "@/lib/data-table";
import type { Entry, Wallet } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SortableHeader } from "@/components/data-table/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

const MERGEABLE_STATUSES = new Set(["unallocated", "partially_allocated"]);

function entryClientKey(entry: Entry): string | null {
  if (!entry.client_name || !entry.client_phone) return null;
  return `${entry.client_name.trim().toLowerCase()}|${entry.client_phone.trim()}`;
}

function availableSummary(entry: Entry) {
  const parts = Object.entries(entry.available_by_currency).map(([currency, amount]) =>
    formatMoney(amount, currency)
  );
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function walletsSummary(entry: Entry, walletNameById: Map<string, string>) {
  const names = [...new Set(entry.lines.map((line) => walletNameById.get(line.wallet_id) ?? line.wallet_id.slice(0, 8)))];
  return names.length > 0 ? names.join(" · ") : "—";
}

export function EntriesTable({
  entries,
  wallets,
  sortBy,
  sortDir,
  search,
}: {
  entries: Entry[];
  wallets: Wallet[];
  sortBy?: string;
  sortDir?: SortDir;
  search?: string;
}) {
  const walletNameById = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mergeClientName, setMergeClientName] = useState("");
  const [mergeClientPhone, setMergeClientPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const selectedEntries = entries.filter((entry) => selected.has(entry.id));
  const selectedClientKeys = selectedEntries.map(entryClientKey);
  // Deux entrées sans aucun client renseigné (clé null des deux côtés) sont considérées comme
  // "même client" pour la fusion : seul un mélange anonyme/nommé ou deux clients différents
  // bloque la fusion.
  const sameClientSelection =
    selectedEntries.length >= 2 && selectedClientKeys.every((key) => key === selectedClientKeys[0]);
  // Des entrées enregistrées sans savoir de quel client il s'agissait peuvent être fusionnées ;
  // le client est alors renseigné au moment de la fusion plutôt qu'à la création.
  const selectionIsAnonymous = sameClientSelection && selectedClientKeys[0] === null;

  function toggle(entryId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  }

  function merge() {
    if (!sameClientSelection) {
      toast.error("Sélectionne uniquement des entrées du même client pour fusionner.");
      return;
    }
    startTransition(async () => {
      const result = await mergeEntriesAction([...selected], {
        client_name: mergeClientName.trim() || undefined,
        client_phone: mergeClientPhone.trim() || undefined,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Entrées fusionnées en ${result.data.reference}.`);
      setSelected(new Set());
      setMergeClientName("");
      setMergeClientPhone("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size >= 2 && (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-card px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <div>{selected.size} entrées sélectionnées</div>
              {!sameClientSelection && (
                <div className="text-xs text-warning">
                  La fusion est prévue pour des entrées du même client.
                </div>
              )}
            </div>
            <Button size="sm" onClick={merge} disabled={isPending || !sameClientSelection}>
              {isPending ? "Fusion..." : "Fusionner"}
            </Button>
          </div>
          {selectionIsAnonymous && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Client (optionnel)"
                value={mergeClientName}
                onChange={(e) => setMergeClientName(e.target.value)}
                aria-label="Nom du client à associer à la fusion"
              />
              <Input
                placeholder="Téléphone client (optionnel)"
                value={mergeClientPhone}
                onChange={(e) => setMergeClientPhone(e.target.value)}
                aria-label="Téléphone du client à associer à la fusion"
              />
            </div>
          )}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <SortableHeader column="reference" label="Référence" currentSort={sortBy} currentDir={sortDir} search={search} />
            <TableHead>Statut</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead className="text-right">Disponible</TableHead>
            <SortableHeader column="created_at" label="Date" currentSort={sortBy} currentDir={sortDir} search={search} />
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                {MERGEABLE_STATUSES.has(entry.status) && !entry.merged_into_id && (
                  <Checkbox
                    checked={selected.has(entry.id)}
                    onCheckedChange={() => toggle(entry.id)}
                    aria-label="Sélectionner pour fusion"
                  />
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">
                <Link href={`/entries/${entry.id}`} className="hover:underline">
                  {entry.reference}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={entry.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {entry.client_name ? (
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{entry.client_name}</span>
                    <span className="text-xs">{entry.client_phone ?? "—"}</span>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{walletsSummary(entry, walletNameById)}</TableCell>
              <TableCell className="text-right tabular-nums">{availableSummary(entry)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/entries/${entry.id}`}>
                      <EyeIcon />
                      Voir
                    </Link>
                  </Button>
                  {entry.status !== "consumed" && (
                    <>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/transfers?entry=${entry.id}`}>
                          <ArrowLeftRight />
                          Envoi
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/payments?entry=${entry.id}`}>
                          <HandCoins />
                          Paiement client
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
