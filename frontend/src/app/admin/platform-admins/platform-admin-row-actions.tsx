"use client";

import { useTransition } from "react";
import { BanIcon, CircleArrowUpIcon } from "lucide-react";
import { toast } from "sonner";

import { setAdminUserStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types/api";
import { EditPlatformAdminDialog } from "./edit-platform-admin-dialog";
import { DeletePlatformAdminButton } from "./delete-platform-admin-button";

export function PlatformAdminRowActions({ admin }: { admin: AdminUser }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        disabled={isPending}
        title={admin.is_active ? "Suspendre" : "Réactiver"}
        aria-label={admin.is_active ? "Suspendre" : "Réactiver"}
        onClick={() =>
          startTransition(async () => {
            const result = await setAdminUserStatusAction(admin.id, null, !admin.is_active);
            if (!result.ok) {
              toast.error(result.message);
              return;
            }
            toast.success(admin.is_active ? "Compte suspendu." : "Compte réactivé.");
          })
        }
      >
        {admin.is_active ? <BanIcon className="size-4" /> : <CircleArrowUpIcon className="size-4" />}
        <span className="sr-only">{admin.is_active ? "Suspendre" : "Réactiver"}</span>
      </Button>
      <EditPlatformAdminDialog admin={admin} />
      <DeletePlatformAdminButton adminId={admin.id} adminName={admin.full_name} />
    </div>
  );
}
