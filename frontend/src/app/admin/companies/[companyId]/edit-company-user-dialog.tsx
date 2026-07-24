"use client";

import { PencilIcon } from "lucide-react";

import { updateCompanyUserAction } from "@/actions/admin";
import { UpdateEntityDialog } from "@/components/update-entity-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminUser } from "@/types/api";

export function EditCompanyUserDialog({ companyId, user }: { companyId: string; user: AdminUser }) {
  return (
    <UpdateEntityDialog
      trigger={
        <Button variant="outline" size="icon" className="size-8" title="Modifier" aria-label="Modifier">
          <PencilIcon className="size-4" />
          <span className="sr-only">Modifier</span>
        </Button>
      }
      title={`Modifier ${user.full_name}`}
      description="Le mot de passe est optionnel. Laisser le champ vide pour le conserver."
      action={async (_prevState, formData) => {
        const password = String(formData.get("password") ?? "").trim();
        const result = await updateCompanyUserAction(companyId, user.id, {
          full_name: String(formData.get("full_name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          password: password || undefined,
        });
        return result.ok ? { status: "success" } : { status: "error", message: result.message };
      }}
      successMessage="Compte mis à jour."
      submitLabel="Mettre à jour"
    >
      {() => (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor={`full_name-${user.id}`}>Nom complet</Label>
            <Input id={`full_name-${user.id}`} name="full_name" defaultValue={user.full_name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`phone-${user.id}`}>Téléphone</Label>
            <Input id={`phone-${user.id}`} name="phone" defaultValue={user.phone} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`password-${user.id}`}>Nouveau mot de passe</Label>
            <Input id={`password-${user.id}`} name="password" type="password" placeholder="Laisser vide" />
          </div>
        </>
      )}
    </UpdateEntityDialog>
  );
}
