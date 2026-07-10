"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { mergeEntriesAction } from "@/actions/entries";
import { formatDate, formatMoney } from "@/lib/format";
import type { Entry } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";

function entryClientKey(entry: Entry): string | null {
  if (!entry.client_name || !entry.client_phone) return null;
  return `${entry.client_name.trim().toLowerCase()}|${entry.client_phone.trim()}`;
}

export function MergeSameClientEntriesCard({
  entry,
  candidates,
}: {
  entry: Entry;
  candidates: Entry[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const referenceClient = useMemo(() => entryClientKey(entry), [entry]);

  if (!referenceClient) {
    return null;
  }

  const mergeable = candidates.filter((candidate) => entryClientKey(candidate) === referenceClient);
  if (mergeable.length === 0) {
    return null;
  }

  function toggle(entryId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  }

  function merge() {
    const ids = [entry.id, ...selected];
    if (ids.length < 2) {
      toast.error("Sélectionne au moins deux entrées du même client.");
      return;
    }

    startTransition(async () => {
      const result = await mergeEntriesAction(ids, `Fusion du client ${entry.client_name ?? ""}`.trim());
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Entrées fusionnées en ${result.data.reference}.`);
      setSelected(new Set());
      router.push(`/entries/${result.data.id}`);
      router.refresh();
    });
  }

  const selectedCount = selected.size + 1;

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">Fusionner les entrées du même client</CardTitle>
        <p className="text-sm text-muted-foreground">
          {entry.client_name ?? "Client"} · {entry.client_phone ?? "Téléphone non renseigné"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Sélection
            </div>
            <div className="text-sm text-foreground">
              {selectedCount} entrée{selectedCount > 1 ? "s" : ""} prête{selectedCount > 1 ? "s" : ""} à fusionner
            </div>
          </div>
          <Button disabled={selectedCount < 2 || isPending} onClick={merge}>
            {isPending ? "Fusion..." : "Fusionner"}
          </Button>
        </div>

        <div className="grid gap-3">
          {mergeable.map((candidate) => (
            <label
              key={candidate.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition-colors hover:bg-muted/30"
            >
              <Checkbox
                checked={selected.has(candidate.id)}
                onCheckedChange={() => toggle(candidate.id)}
                aria-label={`Sélectionner ${candidate.reference}`}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/entries/${candidate.id}`} className="font-mono text-xs font-medium hover:underline">
                    {candidate.reference}
                  </Link>
                  <StatusBadge status={candidate.status} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Disponible {Object.entries(candidate.available_by_currency).map(([currency, amount]) => (
                    <span key={currency} className="mr-2 inline-block tabular-nums">
                      {formatMoney(amount, currency)}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(candidate.created_at)}</div>
              </div>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
