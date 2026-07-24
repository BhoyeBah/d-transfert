import type { Metadata } from "next";

import { listCollaborations } from "@/lib/data/collaborations";
import { listPrivateRates } from "@/lib/data/private-rates";
import { getCompanyMe } from "@/lib/data/company";
import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import { formatDate } from "@/lib/format";
import { sendModeLabels } from "@/lib/validation/transfers";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreatePrivateRateDialog } from "./create-private-rate-dialog";
import { RateStatusButton } from "./rate-status-button";

export const metadata: Metadata = { title: "Taux d'envoi — D-Transfert" };

export default async function PrivateRatesPage() {
  const [rates, collaborations, company, settings] = await Promise.all([
    listPrivateRates(),
    listCollaborations(),
    getCompanyMe(),
    getPublicPlatformSettings(),
  ]);
  const collaborationById = new Map(collaborations.map((c) => [c.id, c]));
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const sorted = [...rates].sort((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    return b.created_at.localeCompare(a.created_at);
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Taux d'envoi"
        description="Votre taux d'envoi privé, par paire de devises (ex. XOF → GNF) — jamais visible par vos collaborateurs. Défini une seule fois, il s'applique automatiquement à tous les envois dans cette paire, quel que soit le collaborateur, et vous pouvez le changer à tout moment."
        action={
          <CreatePrivateRateDialog
            defaultCurrency={company.default_currency}
            collaborations={acceptedCollaborations}
            supportedCurrencies={settings.supported_currencies}
          />
        }
      />

      <Card className="py-0">
        {sorted.length === 0 ? (
          <EmptyState
            message="Aucun taux d'envoi défini."
            action={
              <CreatePrivateRateDialog
                defaultCurrency={company.default_currency}
                collaborations={acceptedCollaborations}
                supportedCurrencies={settings.supported_currencies}
              />
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paire</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Portée</TableHead>
                <TableHead>Type d&apos;opération</TableHead>
                <TableHead className="text-right">Taux</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((rate) => {
                const collaboration = rate.collaboration_id ? collaborationById.get(rate.collaboration_id) : null;
                return (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.currency} → {rate.target_currency ?? "toutes devises"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rate.country ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {rate.collaboration_id ? (
                        <Badge variant="outline">
                          {collaboration ? collaboration.counterparty_company_name : "Collaboration spécifique"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Tous les collaborateurs</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rate.operation_type ? sendModeLabels[rate.operation_type] : "Tous"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{rate.rate}</TableCell>
                    <TableCell>
                      <StatusBadge status={rate.is_active ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(rate.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <RateStatusButton rateId={rate.id} isActive={rate.is_active} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
