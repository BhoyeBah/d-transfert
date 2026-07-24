"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateCompanyAction } from "@/actions/company";
import { mergeCurrencies } from "@/lib/currencies";
import { initialActionState } from "@/lib/action-state";
import { isStaleServerActionError, recoverFromStaleServerAction } from "@/lib/server-action-recovery";
import type { CompanyMe } from "@/types/api";
import { CurrencySelect } from "@/components/currency-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompanyForm({
  company,
  supportedCurrencies,
}: {
  company: CompanyMe;
  supportedCurrencies: string[];
}) {
  const [state, setState] = useState(initialActionState);
  const [isPending, startTransition] = useTransition();
  const [currency, setCurrency] = useState(company.default_currency);
  const currencies = mergeCurrencies(supportedCurrencies, company.default_currency);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await updateCompanyAction(state, formData);
        setState(result);
        if (result.status === "success") {
          toast.success("Entreprise mise à jour avec succès.");
        }
      } catch (error) {
        if (isStaleServerActionError(error)) {
          recoverFromStaleServerAction();
          return;
        }
        throw error;
      }
    });
  }

  return (
    <form onSubmit={onSubmit} method="post" className="grid gap-4">
      {state.status === "error" && state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nom de l&apos;entreprise</Label>
        <Input id="name" name="name" defaultValue={company.name} required />
        {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" name="address" defaultValue={company.address ?? ""} required />
        {state.fieldErrors?.address && (
          <p className="text-sm text-destructive">{state.fieldErrors.address[0]}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={company.phone} required />
          {state.fieldErrors?.phone && <p className="text-sm text-destructive">{state.fieldErrors.phone[0]}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="default_currency">Devise par défaut</Label>
          <CurrencySelect
            id="default_currency"
            name="default_currency"
            value={currency}
            onValueChange={setCurrency}
            currencies={currencies}
          />
          {state.fieldErrors?.default_currency && (
            <p className="text-sm text-destructive">{state.fieldErrors.default_currency[0]}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
