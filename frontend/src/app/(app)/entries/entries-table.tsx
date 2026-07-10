"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, HandCoins, EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { mergeEntriesAction } from "@/actions/entries";
import { formatDate, formatMoney } from "@/lib/format";
import type { SortDir } from "@/lib/data-table";
import type { Entry } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export function EntriesTable({
  entries,
  sortBy,
  sortDir,
  search,
}: {
  entries: Entry[];
  sortBy?: string;
  sortDir?: SortDir;
  search?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const selectedEntries = entries.filter((entry) => selected.has(entry.id));
  const selectedClientKeys = new Set(
    selectedEntries.map(entryClientKey).filter((key): key is string => Boolean(key))
  );
  const sameClientSelection = selectedEntries.length >= 2 && selectedEntries.every((entry) => entryClientKey(entry) !== null) && selectedClientKeys.size === 1;

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
      const result = await mergeEntriesAction([...selected]);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Entrées fusionnées en ${result.data.reference}.`);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size >= 2 && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
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
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <SortableHeader column="reference" label="Référence" currentSort={sortBy} currentDir={sortDir} search={search} />
            <TableHead>Statut</TableHead>
            <TableHead>Client</TableHead>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
