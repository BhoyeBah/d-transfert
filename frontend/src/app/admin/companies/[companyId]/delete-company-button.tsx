"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteAdminCompanyAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteCompanyButton({
  companyId,
  companyName,
  compact = false,
}: {
  companyId: string;
  companyName: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAdminCompanyAction(companyId);
      if (!result.ok) {
        toast.error(result.message ?? "Erreur lors de la suppression.");
        return;
      }
      toast.success(`L'entreprise "${companyName}" a été supprimée.`);
      setOpen(false);
      router.push("/admin/companies");
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size={compact ? "icon" : "sm"}
          className={compact ? "size-8" : "gap-1.5"}
          aria-label={`Supprimer l'entreprise ${companyName}`}
        >
          <Trash2Icon className="size-4" />
          {!compact && "Supprimer l'entreprise"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer &quot;{companyName}&quot; ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est <strong>irréversible</strong>. L&apos;entreprise, tous ses
            utilisateurs, wallets, transferts, paiements, collaborations et données associées
            seront définitivement supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Suppression…" : "Oui, supprimer définitivement"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
