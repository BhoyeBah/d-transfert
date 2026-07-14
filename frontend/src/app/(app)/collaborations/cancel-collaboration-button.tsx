"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cancelCollaborationAction } from "@/actions/collaborations";
import { Button } from "@/components/ui/button";

export function CancelCollaborationButton({
  collaborationId,
  size = "sm",
}: {
  collaborationId: string;
  size?: "sm" | "default";
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function cancel() {
    startTransition(async () => {
      const result = await cancelCollaborationAction(collaborationId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Demande de collaboration annulée.");
      router.refresh();
    });
  }

  return (
    <Button size={size} variant="outline" disabled={isPending} onClick={cancel}>
      Annuler la demande
    </Button>
  );
}
