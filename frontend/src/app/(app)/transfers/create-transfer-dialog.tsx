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

// La devise cible n'est pas forcément celle de la collaboration : celle-ci ne sert qu'au solde
// commun / aux règlements entre collaborateurs, alors qu'un envoi donné peut payer le
// bénéficiaire dans une autre devise (ex. collaboration réglée en XOF, envoi payé en GNF), du
// moment qu'un taux d'envoi privé actif existe pour cette paire précise. La correspondance exacte
// de devise cible est toujours préférée au taux "toutes destinations" (target_currency absent).
function findMatchingPrivateRate(
  rates: PrivateRate[],
  collaborationId: string,
  currency: string,
  targetCurrency: string,
  sendMode: string
): PrivateRate | undefined {
  const active = rates.filter(
    (rate) =>
      rate.is_active &&
      rate.currency === currency &&
      (rate.target_currency === targetCurrency || rate.target_currency === null)
  );
  for (const wantTarget of [targetCurrency, null]) {
    const candidates = active.filter((rate) => rate.target_currency === wantTarget);
    const match =
      candidates.find((rate) => rate.collaboration_id === collaborationId && rate.operation_type === sendMode) ??
      candidates.find((rate) => rate.collaboration_id === collaborationId && rate.operation_type === null) ??
      candidates.find((rate) => rate.collaboration_id === null && rate.operation_type === null);
    if (match) return match;
  }
  return undefined;
}

export function CreateTransferDialog({
  collaborations,
  entries,
  privateRates,
  canViewPrivateRates,
  initialEntryId,
  initialOpen = false,
}: {
  collaborations: Collaboration[];
  entries: Entry[];
  privateRates: PrivateRate[];
  canViewPrivateRates: boolean;
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
    defaultValues: { send_mode: "cash", currency: "", target_currency: "" },
  });

  const collaborationId = useWatch({ control, name: "collaboration_id" });
  const currency = useWatch({ control, name: "currency" });
  const targetCurrency = useWatch({ control, name: "target_currency" });
  const amount = useWatch({ control, name: "amount" });
  const sendMode = useWatch({ control, name: "send_mode" }) ?? "cash";
  const entryId = useWatch({ control, name: "entry_id" });
  const selectedCollaboration = useMemo(
    () => collaborations.find((c) => c.id === collaborationId),
    [collaborations, collaborationId]
  );
  const eligibleEntries = entries.filter(
    (entry) =>
      !entry.merged_into_id &&
      Object.values(entry.available_by_currency).some((value) => Number(value) > 0)
  );
  const initialEntry = initialEntryId ? entries.find((entry) => entry.id === initialEntryId) : undefined;
  const selectedEntry = entryId ? eligibleEntries.find((entry) => entry.id === entryId) : undefined;
  const entryCurrencies = selectedEntry ? Object.keys(selectedEntry.available_by_currency) : [];
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

  // La devise n'est jamais choisie librement : sans entrée, elle est verrouillée sur celle de
  // la collaboration ; avec une entrée, elle est dérivée des devises réellement disponibles
  // sur cette entrée (le taux d'envoi privé la convertira vers celle de la collaboration si
  // elles diffèrent). Une saisie libre exposait à choisir une devise incohérente par erreur.
  useEffect(() => {
    if (!selectedEntry) {
      setValue("currency", selectedCollaboration?.currency ?? "");
      return;
    }
    const currencies = Object.keys(selectedEntry.available_by_currency);
    if (currencies.length === 1) {
      setValue("currency", currencies[0]);
    } else if (!currencies.includes(currency ?? "")) {
      setValue("currency", "");
    }
  }, [selectedEntry, selectedCollaboration, currency, setValue]);

  // La devise de destination (celle dans laquelle le bénéficiaire est payé) est verrouillée sur
  // celle de la collaboration choisie : c'est la devise réellement utilisée par ce
  // collaborateur (ex. GNF en Guinée), une saisie libre exposait à en choisir une incohérente
  // par erreur. Si un envoi doit vraiment cibler une autre devise, mieux vaut créer une
  // collaboration dédiée dans cette devise.
  useEffect(() => {
    if (selectedCollaboration) {
      setValue("target_currency", selectedCollaboration.currency);
    }
  }, [selectedCollaboration, setValue]);

  const matchedRate = useMemo(() => {
    if (!collaborationId || !currency || !targetCurrency) return undefined;
    return findMatchingPrivateRate(privateRates, collaborationId, currency, targetCurrency, sendMode);
  }, [privateRates, collaborationId, currency, targetCurrency, sendMode]);

  const conversionPreview = useMemo(() => {
    if (!targetCurrency || !currency || !amount || Number.isNaN(amount) || amount <= 0) {
      return null;
    }
    if (currency === targetCurrency) {
      return { amount, currency: targetCurrency, rate: null as string | null };
    }
    if (!matchedRate) {
      return canViewPrivateRates ? ("missing_rate" as const) : ("automatic_rate" as const);
    }
    return {
      amount: amount * Number(matchedRate.rate),
      currency: targetCurrency,
      rate: matchedRate.rate,
    };
  }, [amount, currency, targetCurrency, matchedRate, canViewPrivateRates]);

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
            Le taux d&apos;envoi privé configuré par votre entreprise sera appliqué automatiquement
            lors de la création.
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
              {selectedEntry && entryCurrencies.length > 1 ? (
                <select
                  id="currency"
                  value={currency ?? ""}
                  onChange={(e) => setValue("currency", e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">Choisir…</option>
                  {entryCurrencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              ) : (
                <Input id="currency" value={currency ?? ""} disabled readOnly />
              )}
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="target_currency">Devise de destination (bénéficiaire)</Label>
            <Input id="target_currency" value={targetCurrency ?? ""} disabled readOnly />
            {errors.target_currency && (
              <p className="text-sm text-destructive">{errors.target_currency.message}</p>
            )}
          </div>

          {conversionPreview && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                conversionPreview === "missing_rate"
                  ? "border-destructive/40 text-destructive"
                  : "border-dashed border-input text-muted-foreground"
              }`}
            >
              {conversionPreview === "automatic_rate" ? (
                <p>
                  La conversion sera calculée automatiquement avec le taux d&apos;envoi privé actif.
                  Sa valeur est masquée selon vos permissions.
                </p>
              ) : conversionPreview === "missing_rate" ? (
                <p>
                  Aucun taux d&apos;envoi privé actif pour la paire {currency} → {targetCurrency}.{" "}
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
