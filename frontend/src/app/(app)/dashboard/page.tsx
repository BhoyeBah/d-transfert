import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftRight,
  Building2,
  Clock,
  HandCoins,
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

export const metadata: Metadata = { title: "Tableau de bord — D-Transfert" };

export default async function DashboardPage() {
  const me = await getMe();
  if (me.is_super_admin) {
    return <PlatformAdminOverview />;
  }

  const dashboard = await getDashboard();
  const walletCurrencies = Object.entries(dashboard.wallets_balance_by_currency);
  const totalAlerts = dashboard.transfers_pending_count + dashboard.payments_pending_count;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Vue opérationnelle"
        title="Tableau de bord"
        description="Surveillez en un coup d'œil les soldes, les flux du jour et les alertes qui méritent une action."
        action={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Alertes
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{totalAlerts}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Envois
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums">
                {dashboard.transfers_today_count}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Paiements
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums">
                {dashboard.payments_pending_count}
              </div>
            </div>
          </div>
        }
      />

      <section className="grid gap-4 rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
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
        <StatTile label="Entrées aujourd'hui" value={dashboard.entries_today_count} icon={ScrollText} />
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-primary via-cyan-400 to-emerald-400" />
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
