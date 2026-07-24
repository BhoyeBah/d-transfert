"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createAdminCompanyAction } from "@/actions/admin";
import type { ActionState } from "@/lib/action-state";
import { CurrencySelect } from "@/components/currency-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateCompanyData = {
  company_id: string;
  registration_code: string;
  owner_user_id: string;
};

type CreateCompanyState = ActionState & {
  data?: CreateCompanyData;
};

const INITIAL_STATE: CreateCompanyState = { status: "idle" };

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? "Création..." : "Créer l'entreprise"}
    </Button>
  );
}

export function CreateCompanyDialog({ supportedCurrencies }: { supportedCurrencies: string[] }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<string>(supportedCurrencies[0] ?? "XOF");
  const [state, setState] = useState<CreateCompanyState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function resetForm() {
    setState(INITIAL_STATE);
    setCurrency(supportedCurrencies[0] ?? "XOF");
    formRef.current?.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = (await createAdminCompanyAction(state, formData)) as CreateCompanyState;
      setState(result);
      if (result.status === "success") {
        toast.success("Entreprise créée avec succès.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nouvelle entreprise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer une entreprise</DialogTitle>
          <DialogDescription>
            L&apos;admin peut créer une entreprise manuellement avec un compte propriétaire associé.
          </DialogDescription>
        </DialogHeader>

        {state.status === "success" && state.data ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
              <p className="font-semibold text-foreground">Entreprise créée avec succès.</p>
              <p className="mt-2 text-muted-foreground">
                Code d&apos;inscription et matricule du owner:
              </p>
              <p className="mt-1 font-mono text-base font-semibold">{state.data.registration_code}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Conservez ce code pour le premier accès du propriétaire.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                }}
              >
                Créer une autre
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="company_name">Nom de l&apos;entreprise</Label>
              <Input id="company_name" name="company_name" required />
              {state.fieldErrors?.company_name && (
                <p className="text-sm text-destructive">{state.fieldErrors.company_name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="company_phone">Téléphone entreprise</Label>
                <Input id="company_phone" name="company_phone" placeholder="+224..." required />
                {state.fieldErrors?.company_phone && (
                  <p className="text-sm text-destructive">{state.fieldErrors.company_phone[0]}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="default_currency">Devise par défaut</Label>
                <CurrencySelect
                  id="default_currency"
                  name="default_currency"
                  value={currency}
                  onValueChange={setCurrency}
                  currencies={supportedCurrencies}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="address">Adresse de l&apos;entreprise</Label>
              <Input id="address" name="address" required />
              {state.fieldErrors?.address && (
                <p className="text-sm text-destructive">{state.fieldErrors.address[0]}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="owner_full_name">Nom complet du propriétaire</Label>
              <Input id="owner_full_name" name="owner_full_name" required />
              {state.fieldErrors?.owner_full_name && (
                <p className="text-sm text-destructive">{state.fieldErrors.owner_full_name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
                {state.fieldErrors?.password && (
                  <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password_confirmation">Confirmation</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                />
                {state.fieldErrors?.password_confirmation && (
                  <p className="text-sm text-destructive">{state.fieldErrors.password_confirmation[0]}</p>
                )}
              </div>
            </div>

            {state.status === "error" && state.message && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.message}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <SubmitButton isPending={isPending} />
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
