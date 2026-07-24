"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckIcon, CopyIcon } from "lucide-react";

import { registerAction, type RegisterActionState } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { isStaleServerActionError, recoverFromStaleServerAction } from "@/lib/server-action-recovery";
import { CurrencySelect } from "@/components/currency-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({ supportedCurrencies }: { supportedCurrencies: string[] }) {
  const router = useRouter();
  const [state, setState] = useState<RegisterActionState>(initialActionState);
  const [isPending, startTransition] = useTransition();
  const [currency, setCurrency] = useState<string>(supportedCurrencies[0] ?? "XOF");
  const [copied, setCopied] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Volontairement pas de `<form action={...}>` (Server Action native) : React réinitialise
    // les champs non contrôlés une fois l'action résolue, même en cas d'erreur — l'utilisateur
    // devrait alors tout retaper. En passant par onSubmit + startTransition, les champs déjà
    // saisis restent affichés le temps de corriger uniquement le champ en erreur.
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await registerAction(state, formData);
        setState(result);
      } catch (error) {
        if (isStaleServerActionError(error)) {
          recoverFromStaleServerAction();
          return;
        }
        throw error;
      }
    });
  }

  async function handleCopy() {
    if (!state.registrationCode) return;
    await navigator.clipboard.writeText(state.registrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleContinue() {
    if (state.pendingApproval) {
      router.push(`/login?registered=${state.registrationCode}`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} method="post" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Inscrire votre entreprise</h1>
          <p className="text-sm text-muted-foreground">
            Un matricule dérivé du nom de l&apos;entreprise vous sera attribué (ex : gk-business), il
            servira à votre connexion et à vos collaborations.
          </p>
        </div>

        {state.status === "error" && state.message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
        )}

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
          <Label htmlFor="owner_full_name">Votre nom complet (Owner)</Label>
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Création..." : "Créer l'entreprise"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Se connecter
          </Link>
        </p>
      </form>

      {/* Non fermable (pas de croix, pas de clic extérieur) : le matricule est l'identifiant de
          connexion et ne sera plus jamais affiché après cette étape — l'utilisateur doit
          explicitement confirmer l'avoir noté avant de continuer. */}
      <Dialog open={state.status === "success"}>
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Entreprise créée avec succès</DialogTitle>
            <DialogDescription>
              Ce matricule est votre identifiant de connexion. Notez-le ou copiez-le dès maintenant :
              il ne sera plus affiché après cette étape.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <code className="text-lg font-semibold tracking-wide">{state.registrationCode}</code>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleContinue} className="w-full">
              J&apos;ai noté mon matricule, continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
