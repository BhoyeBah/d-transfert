"use client";

import { useActionState } from "react";

import { updateCompanyAction } from "@/actions/company";
import { initialActionState } from "@/lib/action-state";
import { SUPPORTED_CURRENCIES } from "@/lib/validation/auth";
import type { CompanyMe } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompanyForm({ company }: { company: CompanyMe }) {
  const [state, action] = useActionState(updateCompanyAction, initialActionState);

  return (
    <form action={action} className="grid gap-4">
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
          <select
            id="default_currency"
            name="default_currency"
            defaultValue={company.default_currency}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            required
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {state.fieldErrors?.default_currency && (
            <p className="text-sm text-destructive">{state.fieldErrors.default_currency[0]}</p>
          )}
        </div>
      </div>
      {state.status === "error" && state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
}
