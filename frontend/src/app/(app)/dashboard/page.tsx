import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  Clock,
  HandCoins,
  PlusIcon,
  ScrollText,
  Truck,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { getDashboard } from "@/lib/data/dashboard";
import { getMe } from "@/lib/data/me";
import { formatMoney } from "@/lib/format";
import { hasPermission, PermissionCode } from "@/lib/permissions";
import { AmountDisplay } from "@/components/amount-display";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
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
  const [dashboard, me] = await Promise.all([getDashboard(), getMe()]);
  const walletCurrencies = Object.entries(dashboard.wallets_balance_by_currency);
  const rejectedCount = dashboard.transfers_rejected_count + dashboard.payments_rejected_count;
  const needsAttention = dashboard.transfers_pending_count + dashboard.payments_pending_count + rejectedCount > 0;

  const can = (permission: PermissionCode) => hasPermission(me.permissions, me.is_owner, me.is_super_admin, permission);

  const quickActions = [
    { href: "/entries", label: "Nouvelle entrée", icon: ScrollText, permission: PermissionCode.ENTRY_MANAGE },
    { href: "/transfers", label: "Nouvel envoi", icon: ArrowLeftRight, permission: PermissionCode.TRANSFER_CREATE },
    { href: "/payments", label: "Nouveau paiement", icon: HandCoins, permission: PermissionCode.PAYMENT_CREATE },
    { href: "/wallets", label: "Ajouter un wallet", icon: Wallet, permission: PermissionCode.WALLET_MANAGE },
    { href: "/collaborations", label: "Nouvelle collaboration", icon: Users, permission: PermissionCode.COLLABORATION_MANAGE },
  ].filter((action) => can(action.permission));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de votre activité du jour.</p>
      </div>

      {dashboard.alerts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Alertes importantes</h2>
          <div className="flex flex-col gap-2">
            {dashboard.alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                  alert.severity === "critical"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-pending/30 bg-pending/10 text-pending-foreground"
                }`}
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Position financière</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <StatTile label="Dettes clients" value={formatMoney(dashboard.clients_total_balance)} icon={HandCoins} />
          <StatTile label="Dettes fournisseurs" value={formatMoney(dashboard.suppliers_total_balance)} icon={Truck} />
          <StatTile label="Collaborations actives" value={dashboard.active_collaborations_count} icon={Users} />
        </div>
      </section>

      {needsAttention && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Nécessite votre attention</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Envois en attente"
              value={dashboard.transfers_pending_count}
              icon={Clock}
              tone={dashboard.transfers_pending_count > 0 ? "pending" : "default"}
            />
            <StatTile
              label="Paiements en attente"
              value={dashboard.payments_pending_count}
              icon={Clock}
              tone={dashboard.payments_pending_count > 0 ? "pending" : "default"}
            />
            <StatTile
              label="Opérations rejetées"
              value={rejectedCount}
              icon={XCircle}
              tone={rejectedCount > 0 ? "destructive" : "default"}
            />
            <StatTile
              label="Opérations nationales"
              value={dashboard.national_operations_today_count}
              icon={Building2}
              hint="aujourd'hui"
            />
          </div>
        </section>
      )}

      {quickActions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Actions rapides</h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button key={action.href} variant="outline" asChild>
                <Link href={action.href}>
                  <PlusIcon />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Solde par collaborateur</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.collaborator_balances.length === 0 ? (
              <EmptyState message="Aucune collaboration active pour le moment." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collaborateur</TableHead>
                    <TableHead>Devise</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.collaborator_balances.map((balance) => (
                    <TableRow key={balance.collaboration_id}>
                      <TableCell>
                        <Link
                          href={`/collaborations/${balance.collaboration_id}`}
                          className="font-medium hover:underline"
                        >
                          {balance.collaborator_company_name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">
                          {balance.collaborator_company_matricule}
                        </div>
                      </TableCell>
                      <TableCell>{balance.currency}</TableCell>
                      <TableCell className="text-right">
                        <AmountDisplay value={balance.balance} currency={balance.currency} signed size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aujourd&apos;hui</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Entrées enregistrées</span>
              <span className="font-medium tabular-nums">{dashboard.entries_today_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Envois créés</span>
              <span className="font-medium tabular-nums">{dashboard.transfers_today_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paiements créés</span>
              <span className="font-medium tabular-nums">{dashboard.payments_today_count}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
