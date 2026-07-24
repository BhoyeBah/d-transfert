"use client";

import { PencilIcon } from "lucide-react";

import { updateEmployeeAction } from "@/actions/employees";
import { UpdateEntityDialog } from "@/components/update-entity-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Employee } from "@/types/api";

export function EditEmployeeDialog({ employee }: { employee: Employee }) {
  return (
    <UpdateEntityDialog
      trigger={
        <Button variant="outline" size="icon" className="size-8" title="Modifier" aria-label="Modifier">
          <PencilIcon className="size-4" />
          <span className="sr-only">Modifier</span>
        </Button>
      }
      title={`Modifier ${employee.full_name}`}
      description="Le mot de passe est optionnel. Laisser le champ vide pour le conserver."
      action={async (_prevState, formData) => {
        const password = String(formData.get("password") ?? "").trim();
        const result = await updateEmployeeAction(employee.id, {
          full_name: String(formData.get("full_name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          password: password || undefined,
        });
        return result.ok
          ? { status: "success" }
          : { status: "error", message: result.message };
      }}
      successMessage="Employé mis à jour."
      submitLabel="Mettre à jour"
    >
      {() => (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor={`full_name-${employee.id}`}>Nom complet</Label>
            <Input id={`full_name-${employee.id}`} name="full_name" defaultValue={employee.full_name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`phone-${employee.id}`}>Téléphone</Label>
            <Input id={`phone-${employee.id}`} name="phone" defaultValue={employee.phone} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`password-${employee.id}`}>Nouveau mot de passe</Label>
            <Input id={`password-${employee.id}`} name="password" type="password" placeholder="Laisser vide" />
          </div>
        </>
      )}
    </UpdateEntityDialog>
  );
}
