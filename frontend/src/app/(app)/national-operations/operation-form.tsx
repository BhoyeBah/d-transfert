"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { createNationalOperationAction } from "@/actions/national-operations";
import {
  NATIONAL_OPERATION_TYPES,
  createNationalOperationSchema,
  nationalOperationTypeLabels,
  type NationalOperationFormValues,
} from "@/lib/validation/national-operations";
import type { Wallet } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLUMNS = [
  { direction: "in", title: "Entrée", tone: "text-success" },
  { direction: "out", title: "Sortie", tone: "text-destructive" },
] as const;

export function OperationForm({ wallets }: { wallets: Wallet[] }) {
  const [type, setType] = useState<(typeof NATIONAL_OPERATION_TYPES)[number]>("deposit");

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NationalOperationFormValues>({
    resolver: zodResolver(createNationalOperationSchema),
    defaultValues: {
      lines: [
        { wallet_id: "", direction: "in", amount: 0, currency: wallets[0]?.currency ?? "" },
        { wallet_id: "", direction: "out", amount: 0, currency: wallets[0]?.currency ?? "" },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = useWatch({ control, name: "lines" });

  const currencyTotals = useMemo(() => {
    const totals = new Map<string, { in: number; out: number }>();
    for (const line of watchedLines ?? []) {
      if (!line?.currency) continue;
      const entry = totals.get(line.currency) ?? { in: 0, out: 0 };
      entry.in += Number(line.direction === "in" ? line.amount : 0);
      entry.out += Number(line.direction === "out" ? line.amount : 0);
      totals.set(line.currency, entry);
    }
    return [...totals.entries()].map(([currency, totals]) => ({
      currency,
      ...totals,
      gap: totals.in - totals.out,
    }));
  }, [watchedLines]);

  async function onSubmit(values: NationalOperationFormValues) {
    const result = await createNationalOperationAction(type, values);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Opération validée.");
    reset({
      client_name: "",
      client_phone: "",
      note: "",
      lines: [
        { wallet_id: "", direction: "in", amount: 0, currency: wallets[0]?.currency ?? "" },
        { wallet_id: "", direction: "out", amount: 0, currency: wallets[0]?.currency ?? "" },
      ],
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle opération nationale</CardTitle>
        <p className="text-sm text-muted-foreground">
          Aucun frais : le total des entrées doit égaler le total des sorties, par devise.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label htmlFor="op-type">Type d&apos;opération</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger id="op-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NATIONAL_OPERATION_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {nationalOperationTypeLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errors.lines?.root && <p className="text-sm text-destructive">{errors.lines.root.message}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            {COLUMNS.map((column) => (
              <div key={column.direction} className="flex flex-col gap-3 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${column.tone}`}>{column.title}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        wallet_id: "",
                        direction: column.direction,
                        amount: 0,
                        currency: wallets[0]?.currency ?? "",
                      })
                    }
                  >
                    <PlusIcon />
                    Ajouter une ligne
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => {
                    if (watchedLines?.[index]?.direction !== column.direction) return null;
                    const linesInColumn = fields.filter(
                      (_, i) => watchedLines?.[i]?.direction === column.direction
                    ).length;

                    return (
                      <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
                        <div className="grid gap-1">
                          <Label className="text-xs">Wallet</Label>
                          <select
                            {...register(`lines.${index}.wallet_id`, {
                              onChange: (e) => {
                                const wallet = wallets.find((w) => w.id === e.target.value);
                                if (wallet) {
                                  setValue(`lines.${index}.currency`, wallet.currency, { shouldDirty: true });
                                }
                              },
                            })}
                            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                          >
                            <option value="">Choisir…</option>
                            {wallets.map((wallet) => (
                              <option key={wallet.id} value={wallet.id}>
                                {wallet.name} ({wallet.currency})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Montant</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-28"
                            {...register(`lines.${index}.amount`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                // Cas courant (un wallet d'entrée, un wallet de sortie) : reporter
                                // automatiquement le montant de l'autre côté, il n'y a alors
                                // aucune ambiguïté sur la ligne à mettre à jour.
                                const oppositeDirection = column.direction === "in" ? "out" : "in";
                                const oppositeIndexes = fields
                                  .map((_, i) => i)
                                  .filter((i) => watchedLines?.[i]?.direction === oppositeDirection);
                                if (oppositeIndexes.length === 1) {
                                  const value = e.target.valueAsNumber;
                                  setValue(`lines.${oppositeIndexes[0]}.amount`, Number.isFinite(value) ? value : 0, {
                                    shouldDirty: true,
                                  });
                                }
                              },
                            })}
                          />
                          <input type="hidden" {...register(`lines.${index}.currency`)} />
                          <input type="hidden" {...register(`lines.${index}.direction`)} />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={linesInColumn <= 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon className="text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {currencyTotals.length > 0 && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <div className="grid gap-2">
                {currencyTotals.map((summary) => {
                  const balanced = summary.gap === 0;
                  return (
                    <div key={summary.currency} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{summary.currency}</span>
                      <span className="tabular-nums text-success">Entrées {summary.in.toFixed(2)}</span>
                      <span className="tabular-nums text-destructive">Sorties {summary.out.toFixed(2)}</span>
                      <span className={balanced ? "text-success" : "text-warning"}>
                        Écart {summary.gap.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="client_name">Client (optionnel)</Label>
              <Input id="client_name" {...register("client_name")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="client_phone">Téléphone client (optionnel)</Label>
              <Input id="client_phone" {...register("client_phone")} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" {...register("note")} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Validation..." : "Valider l'opération"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
