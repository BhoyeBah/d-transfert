"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { acceptCollaborationAction, rejectCollaborationAction } from "@/actions/collaborations";
import type { Collaboration } from "@/types/api";
import { Button } from "@/components/ui/button";

export function CollaborationRowActions({
  collaboration,
  isTarget,
}: {
  collaboration: Collaboration;
  isTarget: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function accept() {
    startTransition(async () => {
      const result = await acceptCollaborationAction(collaboration.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Collaboration acceptée.");
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectCollaborationAction(collaboration.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Collaboration rejetée.");
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button asChild size="sm" variant="ghost">
        <Link href={`/collaborations/${collaboration.id}`}>Voir</Link>
      </Button>
      {collaboration.status === "pending" && isTarget && (
        <>
          <Button size="sm" disabled={isPending} onClick={accept}>
            Accepter
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={reject}>
            Rejeter
          </Button>
        </>
      )}
    </div>
  );
}
