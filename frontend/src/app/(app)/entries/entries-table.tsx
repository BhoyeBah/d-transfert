"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { mergeEntriesAction } from "@/actions/entries";
import { formatDate, formatMoney } from "@/lib/format";
import type { Collaboration, Entry, Wallet } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { CreatePaymentDialog } from "@/app/(app)/payments/create-payment-dialog";
import { CreateTransferDialog } from "@/app/(app)/transfers/create-transfer-dialog";

const MERGEABLE_STATUSES = new Set(["unallocated", "partially_allocated"]);
const TRANSFORMABLE_STATUSES = new Set(["unallocated", "partially_allocated"]);

function isTransformable(entry: Entry) {
  return (
    TRANSFORMABLE_STATUSES.has(entry.status) &&
    !entry.merged_into_id &&
    Object.keys(entry.available_by_currency).length > 0
  );
}

function availableSummary(entry: Entry) {
  const parts = Object.entries(entry.available_by_currency).map(([currency, amount]) =>
    formatMoney(amount, currency)
  );
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function grossSummary(entry: Entry) {
  const totals = new Map<string, number>();
  for (const line of entry.lines) {
    totals.set(line.currency, (totals.get(line.currency) ?? 0) + Number(line.amount));
  }
  const parts = [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency));
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function EntriesTable({
  entries,
  collaborations,
  wallets,
}: {
  entries: Entry[];
  collaborations: Collaboration[];
  wallets: Wallet[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(entryId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  }

  function merge() {
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
        <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
          <span className="text-sm">{selected.size} entrées sélectionnées</span>
          <Button size="sm" onClick={merge} disabled={isPending}>
            {isPending ? "Fusion..." : "Fusionner"}
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Référence</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Montant reçu</TableHead>
            <TableHead className="text-right">Disponible</TableHead>
            <TableHead>Date</TableHead>
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
              <TableCell className="text-sm text-muted-foreground">{entry.client_name ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums">{grossSummary(entry)}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{availableSummary(entry)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {isTransformable(entry) && (
                    <>
                      <CreateTransferDialog
                        collaborations={collaborations}
                        entries={[entry]}
                        defaultEntryId={entry.id}
                      />
                      <CreatePaymentDialog
                        collaborations={collaborations}
                        entries={[entry]}
                        wallets={wallets}
                        defaultEntryId={entry.id}
                      />
                    </>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/entries/${entry.id}`}>Voir</Link>
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
