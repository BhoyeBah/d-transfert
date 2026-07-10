"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleXIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { cancelNationalOperationAction } from "@/actions/national-operations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NationalOperationRowActions({
  operationId,
  canCancel,
}: {
  operationId: string;
  canCancel: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function cancel() {
    startTransition(async () => {
      const result = await cancelNationalOperationAction(operationId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Opération annulée.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
        <Link href={`/national-operations/${operationId}`} aria-label="Voir le détail">
          <EyeIcon />
        </Link>
      </Button>

      {canCancel && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isPending}
              aria-label="Annuler l'opération"
            >
              <CircleXIcon />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler l&apos;opération</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Cette action crée un mouvement inverse pour rétablir les soldes. Elle ne peut pas être annulée.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Retour
              </Button>
              <Button type="button" variant="destructive" onClick={cancel} disabled={isPending}>
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
