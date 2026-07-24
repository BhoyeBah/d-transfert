import type { Metadata } from "next";

import { getAdminSettings, listAdminBackups } from "@/lib/data/admin";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { BackupManagementCard } from "./backup-management-card";

export const metadata: Metadata = { title: "Paramètres plateforme — Administration D-Transfert" };

export default async function AdminSettingsPage() {
  const [settings, backups] = await Promise.all([getAdminSettings(), listAdminBackups()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paramètres plateforme"
        description="Paramètres globaux appliqués à l'ensemble des entreprises."
      />

      <Card>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
      <BackupManagementCard backups={backups} maintenanceMode={settings.maintenance_mode} />
    </div>
  );
}
