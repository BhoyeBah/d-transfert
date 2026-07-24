"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateCollaborationAction } from "@/actions/collaborations";
import { mergeCurrencies } from "@/lib/currencies";
import type { Collaboration } from "@/types/api";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/currency-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditCollaborationDialog({
  collaboration,
  size = "sm",
  supportedCurrencies,
}: {
  collaboration: Collaboration;
  size?: "sm" | "default";
  supportedCurrencies: string[];
}) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(collaboration.currency);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currencies = mergeCurrencies(supportedCurrencies, collaboration.currency);

  function submit(formData: FormData) {
    const initialRate = formData.get("initial_rate");
    const note = String(formData.get("note") ?? "");
    startTransition(async () => {
      const result = await updateCollaborationAction(collaboration.id, {
        currency,
        initial_rate: initialRate ? Number(initialRate) : undefined,
        note,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Demande de collaboration modifiée.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant="outline">
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la demande de collaboration</DialogTitle>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit_currency">Devise</Label>
              <CurrencySelect
                id="edit_currency"
                name="currency"
                value={currency}
                onValueChange={setCurrency}
                currencies={currencies}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="initial_rate">Taux collaboratif</Label>
              <Input
                id="initial_rate"
                name="initial_rate"
                type="number"
                min="0"
                step="0.000001"
                defaultValue={collaboration.current_rate ?? undefined}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" name="note" defaultValue={collaboration.note ?? ""} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
