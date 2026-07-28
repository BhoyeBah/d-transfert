import type { Metadata } from "next";
import { DownloadIcon, FileTextIcon } from "lucide-react";

import { listEmployees } from "@/lib/data/employees";
import {
  getDailyReport,
  getMonthlyReport,
  listAuditLogs,
  listClientsReport,
  listCollaboratorBalancesReport,
  listEmployeeActivityReport,
  listFeesReport,
  listRejectedOperationsReport,
  listSuppliersReport,
  listTransactionsReport,
  listWalletHistoryReport,
} from "@/lib/data/reports";
import { listWallets } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatTile } from "@/components/stat-tile";
import { ReportPagination } from "@/components/data-table/report-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Rapports — D-Transfert" };

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function appendFormat(href: string, format: "csv" | "pdf"): string {
  return href.includes("?") ? `${href}&format=${format}` : `${href}?format=${format}`;
}

function ExportLinks({ href }: { href: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" asChild>
        <a href={appendFormat(href, "csv")}>
          <DownloadIcon />
          CSV
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" asChild>
        <a href={appendFormat(href, "pdf")}>
          <FileTextIcon />
          PDF
        </a>
      </Button>
    </div>
  );
}

function toPage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    month?: string;
    date_from?: string;
    date_to?: string;
    wallet_id?: string;
    employee_id?: string;
    transactions_page?: string;
    suppliers_page?: string;
    clients_page?: string;
    fees_page?: string;
    rejected_operations_page?: string;
    wallet_history_page?: string;
    employee_activity_page?: string;
  }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const [year, month] = (params.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
    .split("-")
    .map(Number);
  const dateFrom = params.date_from;
  const dateTo = params.date_to;

  const transactionsPage = toPage(params.transactions_page);
  const suppliersPage = toPage(params.suppliers_page);
  const clientsPage = toPage(params.clients_page);
  const feesPage = toPage(params.fees_page);
  const rejectedOperationsPage = toPage(params.rejected_operations_page);
  const walletHistoryPage = toPage(params.wallet_history_page);
  const employeeActivityPage = toPage(params.employee_activity_page);

  const [
    report,
    monthlyReport,
    auditLogs,
    transactions,
    collaboratorBalances,
    suppliers,
    clients,
    fees,
    rejectedOperations,
    wallets,
    employees,
  ] = await Promise.all([
    getDailyReport(params.date),
    getMonthlyReport(year, month),
    listAuditLogs(),
    listTransactionsReport(dateFrom, dateTo, transactionsPage),
    listCollaboratorBalancesReport(),
    listSuppliersReport(dateFrom, dateTo, suppliersPage),
    listClientsReport(dateFrom, dateTo, clientsPage),
    listFeesReport(dateFrom, dateTo, feesPage),
    listRejectedOperationsReport(dateFrom, dateTo, rejectedOperationsPage),
    listWallets(),
    listEmployees(),
  ]);

  const walletId = params.wallet_id || wallets[0]?.id;
  const employeeId = params.employee_id || employees[0]?.id;
  const [walletHistory, employeeActivity] = await Promise.all([
    walletId
      ? listWalletHistoryReport(walletId, dateFrom, dateTo, walletHistoryPage)
      : Promise.resolve({ items: [], total: 0, page: 1, page_size: 20 }),
    employeeId
      ? listEmployeeActivityReport(employeeId, dateFrom, dateTo, employeeActivityPage)
      : Promise.resolve({ items: [], total: 0, page: 1, page_size: 20 }),
  ]);

  const periodQuery = buildQuery({ date_from: dateFrom, date_to: dateTo });
  const currentParams: Record<string, string | undefined> = {
    date_from: dateFrom,
    date_to: dateTo,
    wallet_id: params.wallet_id,
    employee_id: params.employee_id,
    transactions_page: params.transactions_page,
    suppliers_page: params.suppliers_page,
    clients_page: params.clients_page,
    fees_page: params.fees_page,
    rejected_operations_page: params.rejected_operations_page,
    wallet_history_page: params.wallet_history_page,
    employee_activity_page: params.employee_activity_page,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Rapports" description="Rapports journalier, mensuel, par entité et journal d'audit." />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rapport journalier — {report.date}</CardTitle>
          <form className="flex items-center gap-2" method="get">
            <Input type="date" name="date" defaultValue={params.date ?? report.date} className="h-9 w-40" />
            <Button type="submit" variant="outline" size="sm">
              Afficher
            </Button>
            <ExportLinks href={`/api/reports/daily/export${params.date ? `?date=${params.date}` : ""}`} />
          </form>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Dépôts" value={report.deposits_count} />
            <StatTile label="Retraits" value={report.withdrawals_count} />
            <StatTile label="Échanges" value={report.exchanges_count} />
            <StatTile label="Rééquilibrages" value={report.rebalances_count} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Entrées" value={report.entries_count} />
            <StatTile
              label="Envois créés / approuvés / rejetés"
              value={`${report.transfers_created_count} / ${report.transfers_approved_count} / ${report.transfers_rejected_count}`}
            />
            <StatTile
              label="Paiements créés / approuvés / rejetés"
              value={`${report.payments_created_count} / ${report.payments_approved_count} / ${report.payments_rejected_count}`}
            />
          </div>
          {Object.keys(report.entries_total_by_currency).length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              Total entrées :{" "}
              {Object.entries(report.entries_total_by_currency)
                .map(([currency, amount]) => formatMoney(amount, currency))
                .join(" · ")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rapport mensuel — {monthlyReport.month}</CardTitle>
          <form className="flex items-center gap-2" method="get">
            <Input type="month" name="month" defaultValue={monthlyReport.month} className="h-9 w-40" />
            <Button type="submit" variant="outline" size="sm">
              Afficher
            </Button>
            <ExportLinks href={`/api/reports/monthly/export?year=${year}&month=${month}`} />
          </form>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Dépôts" value={monthlyReport.deposits_count} />
            <StatTile label="Retraits" value={monthlyReport.withdrawals_count} />
            <StatTile label="Échanges" value={monthlyReport.exchanges_count} />
            <StatTile label="Rééquilibrages" value={monthlyReport.rebalances_count} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Entrées" value={monthlyReport.entries_count} />
            <StatTile
              label="Envois créés / approuvés / rejetés"
              value={`${monthlyReport.transfers_created_count} / ${monthlyReport.transfers_approved_count} / ${monthlyReport.transfers_rejected_count}`}
            />
            <StatTile
              label="Paiements créés / approuvés / rejetés"
              value={`${monthlyReport.payments_created_count} / ${monthlyReport.payments_approved_count} / ${monthlyReport.payments_rejected_count}`}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Période des rapports détaillés</CardTitle>
          <form className="flex items-center gap-2" method="get">
            <Input type="date" name="date_from" defaultValue={dateFrom} className="h-9 w-40" />
            <Input type="date" name="date_to" defaultValue={dateTo} className="h-9 w-40" />
            <Button type="submit" variant="outline" size="sm">
              Filtrer
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Laissez les dates vides pour couvrir tout l&apos;historique. Ce filtre s&apos;applique aux rapports
            ci-dessous.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Transactions par période</CardTitle>
          <ExportLinks href={`/api/reports/transactions/export${periodQuery}`} />
        </CardHeader>
        <CardContent>
          {transactions.items.length === 0 ? (
            <EmptyState message="Aucune transaction sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.items.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{row.kind}</TableCell>
                      <TableCell className="font-mono text-xs">{row.reference}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.amount !== null ? formatMoney(row.amount, row.currency ?? undefined) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.status}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={transactionsPage}
                pageSize={transactions.page_size}
                total={transactions.total}
                pageParam="transactions_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Solde par collaborateur</CardTitle>
          <ExportLinks href="/api/reports/collaborator-balances/export" />
        </CardHeader>
        <CardContent>
          {collaboratorBalances.length === 0 ? (
            <EmptyState message="Aucune collaboration active." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collaborateur</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaboratorBalances.map((row) => (
                  <TableRow key={row.collaboration_id}>
                    <TableCell className="text-sm">
                      {row.collaborator_company_name} ({row.collaborator_company_matricule})
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(row.balance, row.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Historique d&apos;un wallet</CardTitle>
          <div className="flex items-center gap-2">
            <form className="flex items-center gap-2" method="get">
              <input type="hidden" name="date_from" value={dateFrom ?? ""} />
              <input type="hidden" name="date_to" value={dateTo ?? ""} />
              <select
                name="wallet_id"
                defaultValue={walletId}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.currency})
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" size="sm">
                Afficher
              </Button>
            </form>
            {walletId && (
              <ExportLinks href={`/api/reports/wallets/${walletId}/history/export${periodQuery}`} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {walletHistory.items.length === 0 ? (
            <EmptyState message="Aucun mouvement sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sens</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Solde après</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletHistory.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm">{row.direction === "in" ? "Entrée" : "Sortie"}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.amount, row.currency)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.balance_after, row.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.source_type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={walletHistoryPage}
                pageSize={walletHistory.page_size}
                total={walletHistory.total}
                pageParam="wallet_history_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Activité par employé</CardTitle>
          <div className="flex items-center gap-2">
            <form className="flex items-center gap-2" method="get">
              <input type="hidden" name="date_from" value={dateFrom ?? ""} />
              <input type="hidden" name="date_to" value={dateTo ?? ""} />
              <select
                name="employee_id"
                defaultValue={employeeId}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name} ({employee.matricule})
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" size="sm">
                Afficher
              </Button>
            </form>
            {employeeId && (
              <ExportLinks href={`/api/reports/employees/${employeeId}/activity/export${periodQuery}`} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {employeeActivity.items.length === 0 ? (
            <EmptyState message="Aucune activité sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeActivity.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.entity_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.note ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={employeeActivityPage}
                pageSize={employeeActivity.page_size}
                total={employeeActivity.total}
                pageParam="employee_activity_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rapport fournisseurs</CardTitle>
          <ExportLinks href={`/api/reports/suppliers/export${periodQuery}`} />
        </CardHeader>
        <CardContent>
          {suppliers.items.length === 0 ? (
            <EmptyState message="Aucun mouvement fournisseur sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm">{row.supplier_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.type}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={suppliersPage}
                pageSize={suppliers.page_size}
                total={suppliers.total}
                pageParam="suppliers_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rapport clients</CardTitle>
          <ExportLinks href={`/api/reports/clients/export${periodQuery}`} />
        </CardHeader>
        <CardContent>
          {clients.items.length === 0 ? (
            <EmptyState message="Aucun mouvement client sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Variation</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm">{row.client_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.delta)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.source_type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={clientsPage}
                pageSize={clients.page_size}
                total={clients.total}
                pageParam="clients_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Rapport des frais</CardTitle>
          <ExportLinks href={`/api/reports/fees/export${periodQuery}`} />
        </CardHeader>
        <CardContent>
          {fees.items.length === 0 ? (
            <EmptyState message="Aucun frais conservé sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.items.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{row.source_type}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.amount, row.currency)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={feesPage}
                pageSize={fees.page_size}
                total={fees.total}
                pageParam="fees_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Opérations rejetées / annulées</CardTitle>
          <ExportLinks href={`/api/reports/rejected-operations/export${periodQuery}`} />
        </CardHeader>
        <CardContent>
          {rejectedOperations.items.length === 0 ? (
            <EmptyState message="Aucune opération rejetée ou annulée sur cette période." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedOperations.items.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{row.kind}</TableCell>
                      <TableCell className="font-mono text-xs">{row.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.reason ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportPagination
                page={rejectedOperationsPage}
                pageSize={rejectedOperations.page_size}
                total={rejectedOperations.total}
                pageParam="rejected_operations_page"
                currentParams={currentParams}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal d&apos;audit</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <EmptyState message="Aucune action enregistrée." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.slice(0, 100).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.entity_type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.note ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
