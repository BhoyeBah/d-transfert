"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updatePrivateRateStatusAction } from "@/actions/private-rates";
import { Button } from "@/components/ui/button";

export function RateStatusButton({ rateId, isActive }: { rateId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const result = await updatePrivateRateStatusAction(rateId, !isActive);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(isActive ? "Taux désactivé." : "Taux activé.");
      router.refresh();
    });
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={toggle}>
      {isActive ? "Désactiver" : "Activer"}
    </Button>
  );
}
