import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeftRight,
  Building2,
  Clock,
  HandCoins,
  Plus,
  ScrollText,
  Truck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { PlatformAdminOverview } from "@/components/platform-admin-overview";
import { PageHeader } from "@/components/page-header";
import { getDashboard } from "@/lib/data/dashboard";
import { getMe } from "@/lib/data/me";
import { formatMoney } from "@/lib/format";
import { hasPermission, PermissionCode } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Tableau de bord — D-Transfert" };

export default async function DashboardPage() {
  const me = await getMe();
  if (me.is_super_admin) {
    return <PlatformAdminOverview />;
  }

  const dashboard = await getDashboard();
  const walletCurrencies = Object.entries(dashboard.wallets_balance_by_currency);
  const pendingCount = dashboard.transfers_pending_count + dashboard.payments_pending_count;
  const canCreateEntry = hasPermission(me.permissions, me.is_owner, me.is_super_admin, PermissionCode.ENTRY_MANAGE);
  const canCreateTransfer = hasPermission(me.permissions, me.is_owner, me.is_super_admin, PermissionCode.TRANSFER_CREATE);
  const canCreatePayment = hasPermission(me.permissions, me.is_owner, me.is_super_admin, PermissionCode.PAYMENT_CREATE);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Vue opérationnelle"
        title="Tableau de bord"
        description="Surveillez en un coup d'œil les soldes, les flux du jour et les alertes qui méritent une action."
        action={
          <div className="flex flex-wrap gap-2">
            {canCreateEntry && (
              <Button variant="outline" asChild>
                <Link href="/entries"><Plus /> Nouvelle entrée</Link>
              </Button>
            )}
            {canCreateTransfer && (
              <Button variant="outline" asChild>
                <Link href="/transfers"><ArrowLeftRight /> Nouvel envoi</Link>
              </Button>
            )}
            {canCreatePayment && (
              <Button asChild>
                <Link href="/payments"><HandCoins /> Nouveau paiement</Link>
              </Button>
            )}
          </div>
        }
      />

      <section aria-label="Situation financière" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {walletCurrencies.length > 0 ? (
          walletCurrencies.map(([currency, balance]) => (
            <StatTile
              key={currency}
              label={`Solde wallets ${currency}`}
              value={formatMoney(balance, currency)}
              icon={Wallet}
            />
          ))
        ) : (
          <StatTile label="Solde wallets" value="—" icon={Wallet} hint="Aucun wallet créé" />
        )}
        <StatTile label="Entrées aujourd'hui" value={dashboard.entries_today_count} icon={ScrollText} hint="flux enregistrés" />
        <StatTile
          label="Opérations nationales"
          value={dashboard.national_operations_today_count}
          icon={Building2}
          hint="aujourd'hui"
        />
        <StatTile
          label="Collaborations actives"
          value={dashboard.active_collaborations_count}
          icon={Users}
        />
      </section>

      <section aria-label="Activité du jour" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Envois aujourd'hui"
          value={dashboard.transfers_today_count}
          icon={ArrowLeftRight}
        />
        <StatTile
          label="Envois en attente"
          value={dashboard.transfers_pending_count}
          icon={Clock}
          tone={dashboard.transfers_pending_count > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Paiements en attente"
          value={dashboard.payments_pending_count}
          icon={Clock}
          tone={dashboard.payments_pending_count > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Opérations rejetées"
          value={dashboard.transfers_rejected_count + dashboard.payments_rejected_count}
          icon={XCircle}
          tone={
            dashboard.transfers_rejected_count + dashboard.payments_rejected_count > 0
              ? "destructive"
              : "default"
          }
        />
      </section>

      {(pendingCount > 0 || dashboard.alerts.length > 0) && (
        <Card className="gap-0 overflow-hidden border-warning/25 py-0">
          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Clock className="size-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">Actions requises</p>
                  <Badge variant="warning">{pendingCount} en attente</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Des opérations attendent une validation ou une vérification de votre équipe.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/transfers">Examiner les opérations <ArrowRight /></Link>
            </Button>
          </div>
          {dashboard.alerts.length > 0 && (
            <div className="border-t border-warning/15 bg-warning/[0.035] px-5 py-3">
              {dashboard.alerts.slice(0, 3).map((alert) => (
                <p key={alert.message} className="text-xs leading-5 text-muted-foreground">{alert.message}</p>
              ))}
            </div>
          )}
        </Card>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Solde par collaborateur</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.collaborator_balances.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune collaboration active.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collaboration</TableHead>
                    <TableHead>Devise</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.collaborator_balances.map((balance) => {
                    const amount = Number(balance.balance);
                    const isDebt = amount < 0;
                    const isZero = amount === 0;
                    return (
                      <TableRow key={balance.collaboration_id}>
                        <TableCell>
                          <Link
                            href={`/collaborations/${balance.collaboration_id}`}
                            className="font-medium hover:underline"
                          >
                            {balance.collaborator_company_name}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {balance.collaborator_company_matricule}
                          </div>
                        </TableCell>
                        <TableCell>{balance.currency}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-medium tabular-nums ${
                                isDebt ? "text-destructive" : isZero ? "" : "text-success"
                              }`}
                            >
                              {formatMoney(Math.abs(amount), balance.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {isZero ? "équilibré" : isDebt ? "vous devez" : "on vous doit"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <StatTile
            label="Dettes clients"
            value={formatMoney(dashboard.clients_total_balance)}
            icon={HandCoins}
          />
          <StatTile
            label="Dettes fournisseurs"
            value={formatMoney(dashboard.suppliers_total_balance)}
            icon={Truck}
          />
        </div>
      </section>
    </div>
  );
}
