"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateAdminCompanyAction } from "@/actions/admin";
import type { AdminCompanyDetail } from "@/types/api";
import { CurrencySelect } from "@/components/currency-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompanyDetailsForm({ company }: { company: AdminCompanyDetail }) {
  const [isPending, startTransition] = useTransition();
  const [currency, setCurrency] = useState(company.default_currency);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateAdminCompanyAction(company.id, {
        name: String(formData.get("name") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim(),
        default_currency: currency,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Entreprise mise à jour.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" defaultValue={company.name} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={company.phone} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" defaultValue={company.address ?? ""} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="default_currency">Devise par défaut</Label>
          <CurrencySelect id="default_currency" name="default_currency" value={currency} onValueChange={setCurrency} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
