"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createTransferAction } from "@/actions/transfers";
import {
  SEND_MODES,
  createTransferSchema,
  sendModeLabels,
  type CreateTransferFormValues,
} from "@/lib/validation/transfers";
import { formatMoney } from "@/lib/format";
import type { Collaboration, Entry, PrivateRate } from "@/types/api";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/currency-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function findMatchingPrivateRate(
  rates: PrivateRate[],
  collaborationId: string,
  currency: string,
  sendMode: string
): PrivateRate | undefined {
  const active = rates.filter((rate) => rate.is_active && rate.currency === currency);
  return (
    active.find((rate) => rate.collaboration_id === collaborationId && rate.operation_type === sendMode) ??
    active.find((rate) => rate.collaboration_id === collaborationId && rate.operation_type === null) ??
    active.find((rate) => rate.collaboration_id === null && rate.operation_type === null)
  );
}

export function CreateTransferDialog({
  collaborations,
  entries,
  privateRates,
  initialEntryId,
  initialOpen = false,
}: {
  collaborations: Collaboration[];
  entries: Entry[];
  privateRates: PrivateRate[];
  initialEntryId?: string | null;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen || Boolean(initialEntryId));
  const [manualClient, setManualClient] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransferFormValues>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: { send_mode: "cash", currency: "" },
  });

  const collaborationId = useWatch({ control, name: "collaboration_id" });
  const currency = useWatch({ control, name: "currency" });
  const amount = useWatch({ control, name: "amount" });
  const sendMode = useWatch({ control, name: "send_mode" }) ?? "cash";
  const entryId = useWatch({ control, name: "entry_id" });
  const selectedCollaboration = collaborations.find((c) => c.id === collaborationId);
  const eligibleEntries = entries.filter(
    (entry) =>
      !entry.merged_into_id &&
      Object.values(entry.available_by_currency).some((value) => Number(value) > 0)
  );
  const initialEntry = initialEntryId ? entries.find((entry) => entry.id === initialEntryId) : undefined;
  const selectedEntry = entryId ? eligibleEntries.find((entry) => entry.id === entryId) : undefined;
  const availableForCurrency =
    selectedEntry && currency ? Number(selectedEntry.available_by_currency[currency] ?? 0) : null;
  const exceedsAvailable = Boolean(
    selectedEntry &&
      availableForCurrency !== null &&
      amount > 0 &&
      !Number.isNaN(amount) &&
      amount > availableForCurrency
  );
  const showClientFields = exceedsAvailable || manualClient;

  useEffect(() => {
    if (!initialEntryId) return;
    setValue("entry_id", initialEntryId);
    if (initialEntry?.client_name) {
      setValue("client_name", initialEntry.client_name);
    }
    if (initialEntry?.client_phone) {
      setValue("client_phone", initialEntry.client_phone);
    }
  }, [initialEntry, initialEntryId, setValue]);

  useEffect(() => {
    if (selectedCollaboration) {
      setValue("currency", selectedCollaboration.currency);
    }
  }, [selectedCollaboration, setValue]);

  const matchedRate = useMemo(() => {
    if (!collaborationId || !currency) return undefined;
    return findMatchingPrivateRate(privateRates, collaborationId, currency, sendMode);
  }, [privateRates, collaborationId, currency, sendMode]);

  const conversionPreview = useMemo(() => {
    if (!selectedCollaboration || !currency || !amount || Number.isNaN(amount) || amount <= 0) {
      return null;
    }
    if (currency === selectedCollaboration.currency) {
      return { amount, currency: selectedCollaboration.currency, rate: null as string | null };
    }
    if (!matchedRate) return "missing_rate" as const;
    return {
      amount: amount * Number(matchedRate.rate),
      currency: selectedCollaboration.currency,
      rate: matchedRate.rate,
    };
  }, [amount, currency, selectedCollaboration, matchedRate]);

  async function onSubmit(values: CreateTransferFormValues) {
    const result = await createTransferAction(values);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(`Envoi ${result.data.reference} créé.`);
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nouvel envoi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Créer un envoi international</DialogTitle>
          <DialogDescription>
            Le taux d&apos;envoi privé configuré pour cette devise sera utilisé pour convertir le
            montant à payer par le collaborateur. Assurez-vous de l&apos;avoir configuré au préalable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="collaboration_id">Collaboration</Label>
            <select
              id="collaboration_id"
              {...register("collaboration_id")}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">Choisir…</option>
              {collaborations.map((collaboration) => (
                <option key={collaboration.id} value={collaboration.id}>
                  {collaboration.counterparty_company_matricule}({collaboration.current_rate})
                </option>
              ))}
            </select>
            {errors.collaboration_id && (
              <p className="text-sm text-destructive">{errors.collaboration_id.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="entry_id">Entrée à transformer (optionnel)</Label>
            <select
              id="entry_id"
              {...register("entry_id")}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="">Aucune — solde direct</option>
              {eligibleEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.reference} —{" "}
                  {Object.entries(entry.available_by_currency)
                    .map(([currency, amount]) => `${amount} ${currency}`)
                    .join(", ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Montant</Label>
              <Input id="amount" type="number" min="0" step="0.01" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Devise</Label>
              <CurrencySelect
                id="currency"
                name="currency"
                value={currency ?? ""}
                onValueChange={(value) => setValue("currency", value)}
              />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
          </div>

          {conversionPreview && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                conversionPreview === "missing_rate"
                  ? "border-destructive/40 text-destructive"
                  : "border-dashed border-input text-muted-foreground"
              }`}
            >
              {conversionPreview === "missing_rate" ? (
                <p>
                  Aucun taux d&apos;envoi privé configuré pour la devise source {currency}.{" "}
                  <Link href="/private-rates" target="_blank" className="underline">
                    Configurez-le depuis la page Taux d&apos;envoi
                  </Link>{" "}
                  avant de créer cet envoi.
                </p>
              ) : (
                <p>
                  Le collaborateur devra payer environ{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatMoney(conversionPreview.amount, conversionPreview.currency)}
                  </span>
                  {conversionPreview.rate && (
                    <span> (taux d&apos;envoi {conversionPreview.rate})</span>
                  )}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="beneficiary_name">Nom du bénéficiaire (optionnel)</Label>
              <Input id="beneficiary_name" {...register("beneficiary_name")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="beneficiary_phone">Téléphone du bénéficiaire</Label>
              <Input id="beneficiary_phone" {...register("beneficiary_phone")} required />
              {errors.beneficiary_phone && (
                <p className="text-sm text-destructive">{errors.beneficiary_phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="send_mode">Mode d&apos;envoi</Label>
            <Select defaultValue="cash" onValueChange={(v) => setValue("send_mode", v as typeof SEND_MODES[number])}>
              <SelectTrigger id="send_mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEND_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {sendModeLabels[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="register_client"
              checked={showClientFields}
              disabled={exceedsAvailable}
              onCheckedChange={(checked) => setManualClient(Boolean(checked))}
            />
            <Label htmlFor="register_client" className="text-sm font-normal">
              Enregistrer un client (montant à recouvrer)
            </Label>
          </div>
          {exceedsAvailable && (
            <p className="text-xs text-warning">
              Le montant dépasse le disponible de l&apos;entrée sélectionnée : un client est requis pour
              enregistrer la dette.
            </p>
          )}

          {showClientFields && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="client_name">Client</Label>
                <Input id="client_name" {...register("client_name")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="client_phone">Téléphone client</Label>
                <Input id="client_phone" {...register("client_phone")} />
              </div>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" {...register("note")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer l'envoi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
