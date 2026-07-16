"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { resetPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ matricule, codeSent }: { matricule?: string; codeSent?: boolean }) {
  const [state, setState] = useState(initialActionState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (codeSent) {
      toast.success("Code de réinitialisation envoyé.");
    }
  }, [codeSent]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await resetPasswordAction(state, formData);
      setState(result);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Nouveau mot de passe</h1>
        <p className="text-sm text-muted-foreground">
          Saisissez le code reçu et votre nouveau mot de passe.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="matricule">Matricule</Label>
        <Input id="matricule" name="matricule" defaultValue={matricule} required />
        {state.fieldErrors?.matricule && (
          <p className="text-sm text-destructive">{state.fieldErrors.matricule[0]}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="otp_code">Code reçu</Label>
        <Input id="otp_code" name="otp_code" inputMode="numeric" required />
        {state.fieldErrors?.otp_code && (
          <p className="text-sm text-destructive">{state.fieldErrors.otp_code[0]}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="new_password">Nouveau mot de passe</Label>
        <Input id="new_password" name="new_password" type="password" autoComplete="new-password" required />
        {state.fieldErrors?.new_password && (
          <p className="text-sm text-destructive">{state.fieldErrors.new_password[0]}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="new_password_confirmation">Confirmation</Label>
        <Input
          id="new_password_confirmation"
          name="new_password_confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.new_password_confirmation && (
          <p className="text-sm text-destructive">{state.fieldErrors.new_password_confirmation[0]}</p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Validation..." : "Réinitialiser le mot de passe"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
