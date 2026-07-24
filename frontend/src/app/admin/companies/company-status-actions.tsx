"use client";

import { useTransition } from "react";
import { BanIcon, CheckCircle2Icon, Clock3Icon } from "lucide-react";
import { toast } from "sonner";

import { setAdminCompanyStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import type { CompanyStatus } from "@/types/api";

const STATUS_ACTIONS: { status: CompanyStatus; label: string }[] = [
  { status: "active", label: "Activer" },
  { status: "pending", label: "Mettre en attente" },
  { status: "suspended", label: "Suspendre" },
];

const STATUS_ICONS: Record<CompanyStatus, typeof CheckCircle2Icon> = {
  active: CheckCircle2Icon,
  pending: Clock3Icon,
  suspended: BanIcon,
};

export function CompanyStatusActions({ companyId, status }: { companyId: string; status: CompanyStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-nowrap gap-2">
      {STATUS_ACTIONS.filter((action) => action.status !== status).map((action) => (
        <Button
          key={action.status}
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          disabled={isPending}
          title={action.label}
          aria-label={action.label}
          onClick={() =>
            startTransition(async () => {
              const result = await setAdminCompanyStatusAction(companyId, action.status);
              if (!result.ok) {
                toast.error(result.message);
                return;
              }
              toast.success("Statut de l'entreprise mis à jour.");
            })
          }
        >
          {(() => {
            const Icon = STATUS_ICONS[action.status];
            return <Icon className="size-4" />;
          })()}
          <span className="sr-only">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
