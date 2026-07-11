"use client";

import { useState } from "react";

import { createPrivateRateAction } from "@/actions/private-rates";
import { CreateEntityDialog } from "@/components/create-entity-dialog";
import { CurrencySelect } from "@/components/currency-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEND_MODES, sendModeLabels } from "@/lib/validation/transfers";

export function CreatePrivateRateDialog({ defaultCurrency }: { defaultCurrency: string }) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [operationType, setOperationType] = useState<string>("");

  return (
    <CreateEntityDialog
      triggerLabel="Définir un taux"
      title="Taux d'envoi privé"
      description="S'applique automatiquement à tous les collaborateurs pour cette devise. Visible uniquement par votre entreprise — jamais par vos collaborateurs. Vous pouvez le changer à tout moment en en définissant un nouveau."
      action={createPrivateRateAction}
      successMessage="Taux enregistré."
    >
      {(state) => (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Devise</Label>
              <CurrencySelect id="currency" name="currency" value={currency} onValueChange={setCurrency} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rate">Taux</Label>
              <Input id="rate" name="rate" type="number" min="0" step="0.000001" required />
              {state.fieldErrors?.rate && (
                <p className="text-sm text-destructive">{state.fieldErrors.rate[0]}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="country">Pays (optionnel, pour vous repérer)</Label>
              <Input id="country" name="country" placeholder="ex. Guinée" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="operation_type">Type d&apos;opération (optionnel)</Label>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger id="operation_type" className="w-full">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  {SEND_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {sendModeLabels[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="operation_type" value={operationType} />
            </div>
          </div>
        </>
      )}
    </CreateEntityDialog>
  );
}
