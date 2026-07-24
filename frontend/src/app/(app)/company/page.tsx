import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCompanyMe } from "@/lib/data/company";
import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import { getMe } from "@/lib/data/me";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyForm } from "./company-form";

export const metadata: Metadata = { title: "Entreprise — D-Transfert" };

export default async function CompanyPage() {
  const [company, me, settings] = await Promise.all([
    getCompanyMe(),
    getMe(),
    getPublicPlatformSettings(),
  ]);
  if (me.is_super_admin) {
    redirect("/admin");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entreprise"
        description="Informations et paramètres de votre entreprise."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{company.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{company.registration_code}</div>
              </div>
              <StatusBadge status={company.status} />
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Téléphone</span>
                <span>{company.phone}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Adresse</span>
                <span className="text-right">{company.address ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Devise par défaut</span>
                <span>{company.default_currency}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Les modifications sont réservées à l&apos;owner.
            </p>
          </CardContent>
        </Card>

        {me.is_owner ? (
          <Card>
            <CardContent className="p-6">
              <CompanyForm company={company} supportedCurrencies={settings.supported_currencies} />
            </CardContent>
          </Card>
        ) : (
          <EmptyState message="Seul l'owner peut modifier les paramètres de l'entreprise." />
        )}
      </div>
    </div>
  );
}
