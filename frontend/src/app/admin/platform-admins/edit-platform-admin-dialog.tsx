"use client";

import { PencilIcon } from "lucide-react";

import { updatePlatformAdminAction } from "@/actions/admin";
import { UpdateEntityDialog } from "@/components/update-entity-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminUser } from "@/types/api";

export function EditPlatformAdminDialog({ admin }: { admin: AdminUser }) {
  return (
    <UpdateEntityDialog
      trigger={
        <Button variant="outline" size="icon" className="size-8" title="Modifier" aria-label="Modifier">
          <PencilIcon className="size-4" />
          <span className="sr-only">Modifier</span>
        </Button>
      }
      title={`Modifier ${admin.full_name}`}
      description="Le mot de passe est optionnel. Laisser le champ vide pour le conserver."
      action={async (_prevState, formData) => {
        const password = String(formData.get("password") ?? "").trim();
        const result = await updatePlatformAdminAction(admin.id, {
          full_name: String(formData.get("full_name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          password: password || undefined,
        });
        return result.ok ? { status: "success" } : { status: "error", message: result.message };
      }}
      successMessage="Compte Super Admin mis à jour."
      submitLabel="Mettre à jour"
    >
      {() => (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor={`full_name-${admin.id}`}>Nom complet</Label>
            <Input id={`full_name-${admin.id}`} name="full_name" defaultValue={admin.full_name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`phone-${admin.id}`}>Téléphone</Label>
            <Input id={`phone-${admin.id}`} name="phone" defaultValue={admin.phone} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`password-${admin.id}`}>Nouveau mot de passe</Label>
            <Input id={`password-${admin.id}`} name="password" type="password" placeholder="Laisser vide" />
          </div>
        </>
      )}
    </UpdateEntityDialog>
  );
}
