"use client";

import { useState } from "react";

import { createPrivateRateAction } from "@/actions/private-rates";
import { mergeCurrencies } from "@/lib/currencies";
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
import type { Collaboration } from "@/types/api";

const ALL_COLLABORATORS = "all";

export function CreatePrivateRateDialog({
  defaultCurrency,
  collaborations = [],
  supportedCurrencies,
}: {
  defaultCurrency: string;
  collaborations?: Collaboration[];
  supportedCurrencies: string[];
}) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [targetCurrency, setTargetCurrency] = useState(defaultCurrency);
  const [collaborationId, setCollaborationId] = useState(ALL_COLLABORATORS);
  const [operationType, setOperationType] = useState<string>("");
  const currencies = mergeCurrencies(supportedCurrencies, defaultCurrency);

  const scopedCollaboration = collaborations.find((c) => c.id === collaborationId);
  // La devise de destination d'un envoi est choisie librement à chaque envoi (indépendante de
  // la devise de la collaboration, qui ne sert qu'au solde commun) — un taux lié à une
  // collaboration précise peut donc très bien cibler une autre devise que celle-ci.

  return (
    <CreateEntityDialog
      triggerLabel="Définir un taux"
      title="Taux d'envoi privé"
      description="Une paire de devises (ex. XOF → GNF) : combien vaut un envoi dans la devise source une fois converti dans la devise cible. Visible uniquement par votre entreprise — jamais par vos collaborateurs. Vous pouvez le changer à tout moment en en définissant un nouveau."
      action={createPrivateRateAction}
      successMessage="Taux enregistré."
    >
      {(state) => (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="collaboration_id">Portée</Label>
            <Select value={collaborationId} onValueChange={setCollaborationId}>
              <SelectTrigger id="collaboration_id" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_COLLABORATORS}>Tous les collaborateurs</SelectItem>
                {collaborations.map((collaboration) => (
                  <SelectItem key={collaboration.id} value={collaboration.id}>
                    {collaboration.counterparty_company_name} ({collaboration.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              name="collaboration_id"
              value={scopedCollaboration ? scopedCollaboration.id : ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Devise source</Label>
              <CurrencySelect
                id="currency"
                name="currency"
                value={currency}
                onValueChange={setCurrency}
                currencies={currencies}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="target_currency">Devise cible</Label>
              <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                <SelectTrigger id="target_currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((code) => (
                    <SelectItem key={code} value={code}>
                      {currency} → {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="target_currency" value={targetCurrency} />
              {state.fieldErrors?.target_currency && (
                <p className="text-sm text-destructive">{state.fieldErrors.target_currency[0]}</p>
              )}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rate">
              Taux ({currency === targetCurrency ? "1 pour 1" : `1 ${currency} = ? ${targetCurrency}`})
            </Label>
            <Input id="rate" name="rate" type="number" min="0" step="0.000001" required />
            {state.fieldErrors?.rate && (
              <p className="text-sm text-destructive">{state.fieldErrors.rate[0]}</p>
            )}
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
