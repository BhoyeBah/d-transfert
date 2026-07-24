"use client";

import { useTransition } from "react";
import { BanIcon, CircleArrowUpIcon } from "lucide-react";
import { toast } from "sonner";

import { setAdminUserStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function UserStatusActions({
  userId,
  companyId,
  isActive,
}: {
  userId: string;
  companyId: string | null;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-8"
      disabled={isPending}
      title={isActive ? "Suspendre" : "Réactiver"}
      aria-label={isActive ? "Suspendre" : "Réactiver"}
      onClick={() =>
        startTransition(async () => {
          const result = await setAdminUserStatusAction(userId, companyId, !isActive);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success(isActive ? "Compte suspendu." : "Compte réactivé.");
        })
      }
    >
      {isActive ? <BanIcon className="size-4" /> : <CircleArrowUpIcon className="size-4" />}
      <span className="sr-only">{isActive ? "Suspendre" : "Réactiver"}</span>
    </Button>
  );
}
