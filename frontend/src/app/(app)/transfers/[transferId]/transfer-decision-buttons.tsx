"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { approveTransferAction, cancelTransferAction, rejectTransferAction } from "@/actions/transfers";
import { formatMoney } from "@/lib/format";
import type { Wallet } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TransferDecisionButtons({
  transferId,
  wallets,
}: {
  transferId: string;
  wallets: Wallet[];
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const router = useRouter();

  function approve(formData: FormData) {
    const walletId = String(formData.get("wallet_id") ?? "");
    const proofFile = formData.get("proof") as File | null;
    startTransition(async () => {
      const result = await approveTransferAction(transferId, walletId, proofFile);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Envoi approuvé.");
      setApproveOpen(false);
      router.refresh();
    });
  }

  function reject(formData: FormData) {
    const reason = String(formData.get("reason") ?? "");
    startTransition(async () => {
      const result = await rejectTransferAction(transferId, reason);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Envoi rejeté.");
      setRejectOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={isPending}>
            Approuver
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver l&apos;envoi</DialogTitle>
            <DialogDescription>
              Sélectionnez le wallet depuis lequel vous avez payé le bénéficiaire — son solde sera
              débité du montant converti — et joignez la preuve du paiement (image ou PDF).
            </DialogDescription>
          </DialogHeader>
          <form action={approve} className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="wallet_id">Wallet utilisé</Label>
              <select
                id="wallet_id"
                name="wallet_id"
                required
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="">Choisir…</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.currency}) — {formatMoney(wallet.balance, wallet.currency)}
                  </option>
                ))}
              </select>
              {wallets.length === 0 && (
                <p className="text-sm text-destructive">
                  Aucun wallet actif dans la devise requise. Créez-en un avant d&apos;approuver.
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="proof">Preuve du paiement</Label>
              <Input
                id="proof"
                name="proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending || wallets.length === 0}>
                Confirmer l&apos;approbation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={isPending}>
            Rejeter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l&apos;envoi</DialogTitle>
          </DialogHeader>
          <form action={reject} className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="reason">Motif du rejet</Label>
              <Textarea id="reason" name="reason" required />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={isPending}>
                Confirmer le rejet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CancelTransferButton({ transferId }: { transferId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await cancelTransferAction(transferId);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success("Envoi annulé.");
          router.refresh();
        })
      }
    >
      Annuler l&apos;envoi
    </Button>
  );
}
