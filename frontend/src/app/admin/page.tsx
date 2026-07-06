import type { Metadata } from "next";
import { BuildingIcon, ShieldXIcon, FileClockIcon } from "lucide-react";

import { listAdminAuditLogs, listAdminCompanies } from "@/lib/data/admin";
import { PageHeader } from "@/components/page-header";
import { StatTile } from "@/components/stat-tile";

export const metadata: Metadata = { title: "Administration plateforme — D-Transfert" };

export default async function AdminOverviewPage() {
  const [companies, auditLogs] = await Promise.all([listAdminCompanies(), listAdminAuditLogs()]);

  const activeCount = companies.filter((company) => company.status === "active").length;
  const suspendedCount = companies.filter((company) => company.status === "suspended").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vue d'ensemble"
        description="Indicateurs plateforme, tous comptes entreprises confondus."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Entreprises actives" value={activeCount} icon={BuildingIcon} tone="success" />
        <StatTile
          label="Entreprises suspendues"
          value={suspendedCount}
          icon={ShieldXIcon}
          tone={suspendedCount > 0 ? "destructive" : "default"}
        />
        <StatTile label="Entrées d'audit récentes" value={auditLogs.length} icon={FileClockIcon} />
      </div>
    </div>
  );
}
