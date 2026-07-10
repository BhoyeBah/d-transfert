"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIRECTION_LABELS = { in: "Entrée", out: "Sortie" } as const;

export function CreateOperationDialog({ wallets }: { wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
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
        { wallet_id: "", direction: "out", amount: 0, currency: wallets[0]?.currency ?? "" },
        { wallet_id: "", direction: "in", amount: 0, currency: wallets[0]?.currency ?? "" },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = useWatch({ control, name: "lines" });
  const firstLineDirection = watchedLines?.[0]?.direction;
  const firstLineAmount = watchedLines?.[0]?.amount;

  useEffect(() => {
    if (fields.length < 2 || firstLineDirection == null) {
      return;
    }

    const mirroredDirection = firstLineDirection === "in" ? "out" : "in";
    const mirroredAmount = Number.isFinite(firstLineAmount) ? firstLineAmount : 0;

    setValue("lines.1.direction", mirroredDirection, { shouldDirty: true, shouldTouch: false });
    setValue("lines.1.amount", mirroredAmount, { shouldDirty: true, shouldTouch: false });
  }, [fields.length, firstLineAmount, firstLineDirection, setValue]);

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
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nouvelle opération
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nouvelle opération nationale</DialogTitle>
          <DialogDescription>
            Aucun frais : le total des entrées doit égaler le total des sorties, par devise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
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

          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="mb-2 font-medium">Totaux calculés</div>
            {currencyTotals.length === 0 ? (
              <p className="text-muted-foreground">Ajoute des lignes pour voir l&apos;équilibre.</p>
            ) : (
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
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Lignes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ wallet_id: "", direction: "in", amount: 0, currency: wallets[0]?.currency ?? "" })}
              >
                <PlusIcon />
                Ajouter une ligne
              </Button>
            </div>
            {errors.lines?.root && <p className="text-sm text-destructive">{errors.lines.root.message}</p>}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2 rounded-md border border-border p-3">
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
                  <Label className="text-xs">Sens</Label>
                  <select
                    {...register(`lines.${index}.direction`)}
                    className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                  >
                    {Object.entries(DIRECTION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
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
                    {...register(`lines.${index}.amount`, { valueAsNumber: true })}
                  />
                  <input type="hidden" {...register(`lines.${index}.currency`)} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length <= 2}
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Validation..." : "Valider l'opération"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
