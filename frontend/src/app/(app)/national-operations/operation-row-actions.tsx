"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { cancelNationalOperationAction } from "@/actions/national-operations";
import { Button } from "@/components/ui/button";
import type { NationalOperationStatus } from "@/types/api";

export function OperationRowActions({
  operationId,
  status,
}: {
  operationId: string;
  status: NationalOperationStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function cancel() {
    startTransition(async () => {
      const result = await cancelNationalOperationAction(operationId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Opération annulée (mouvement inverse créé).");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" asChild title="Voir le détail">
        <Link href={`/national-operations/${operationId}`}>
          <EyeIcon className="size-4" />
        </Link>
      </Button>
      {status === "validated" && (
        <Button
          variant="ghost"
          size="icon"
          title="Annuler l'opération"
          disabled={isPending}
          onClick={cancel}
        >
          <XCircleIcon className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
