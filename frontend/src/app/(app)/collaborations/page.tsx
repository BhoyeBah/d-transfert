import type { Metadata } from "next";
import { Clock, Link2, Users } from "lucide-react";

import { getCompanyMe } from "@/lib/data/company";
import { getCollaboratorBalance, listCollaborations, listCollaborationsPage } from "@/lib/data/collaborations";
import { getMe } from "@/lib/data/me";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/stat-tile";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableSearchForm } from "@/components/data-table/search-form";
import { SortableHeader } from "@/components/data-table/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestCollaborationDialog } from "./request-collaboration-dialog";
import { CollaborationRowActions } from "./collaboration-row-actions";

export const metadata: Metadata = { title: "Collaborations — D-Transfert" };

export default async function CollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [collaborationsPage, allCollaborations, company, me] = await Promise.all([
    listCollaborationsPage({ page, search, sortBy, sortDir }),
    listCollaborations(),
    getCompanyMe(),
    getMe(),
  ]);
  const collaborations = collaborationsPage.items;
  const acceptedCount = allCollaborations.filter((collaboration) => collaboration.status === "accepted").length;
  const pendingCount = allCollaborations.filter((collaboration) => collaboration.status === "pending").length;
  const withRateCount = allCollaborations.filter((collaboration) => collaboration.current_rate !== null).length;

  const balances = await Promise.all(
    collaborations
      .filter((collaboration) => collaboration.status === "accepted")
      .map((collaboration) => getCollaboratorBalance(collaboration.id))
  );
  const balanceByCollaborationId = new Map(balances.map((balance) => [balance.collaboration_id, balance]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Collaborations"
        description="Entreprises partenaires pour les envois internationaux."
        action={<RequestCollaborationDialog defaultCurrency={company.default_currency} />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Collaborations" value={collaborationsPage.total} icon={Users} />
        <StatTile
          label="Acceptées"
          value={acceptedCount}
          icon={Link2}
          tone={acceptedCount > 0 ? "success" : "default"}
        />
        <StatTile
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatTile label="Avec taux" value={withRateCount} icon={Link2} hint="Taux collaboratif actif" />
      </section>

      {collaborationsPage.total === 0 && !search ? (
        <EmptyState message="Aucune collaboration pour le moment." />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm
            defaultValue={search}
            sortBy={sortBy}
            sortDir={sortDir}
            placeholder="Rechercher une collaboration…"
          />
          <Card className="py-0">
            {collaborations.length === 0 ? (
              <EmptyState message="Aucune collaboration ne correspond à cette recherche." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Rôle</TableHead>
                    <SortableHeader
                      column="currency"
                      label="Devise"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                    <SortableHeader
                      column="status"
                      label="Statut"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                    <TableHead className="text-right">Taux actuel</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                    <SortableHeader
                      column="created_at"
                      label="Date"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborations.map((collaboration) => (
                    <TableRow key={collaboration.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{collaboration.counterparty_company_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {collaboration.counterparty_company_matricule}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={collaboration.initiator_company_id === me.company_id ? "default" : "outline"}>
                          {collaboration.initiator_company_id === me.company_id ? "Initiateur" : "Sollicité"}
                        </Badge>
                      </TableCell>
                      <TableCell>{collaboration.currency}</TableCell>
                      <TableCell>
                        <StatusBadge status={collaboration.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {collaboration.current_rate ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {(() => {
                          const balance = balanceByCollaborationId.get(collaboration.id);
                          if (!balance) return "—";
                          const amount = Number(balance.balance);
                          const isDebt = amount < 0;
                          const isZero = amount === 0;
                          return (
                            <div className="flex flex-col items-end">
                              <span className={isDebt ? "text-destructive" : isZero ? "" : "text-success"}>
                                {formatMoney(Math.abs(amount), balance.currency)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isZero ? "équilibré" : isDebt ? "vous devez" : "on vous doit"}
                              </span>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(collaboration.created_at)}
                      </TableCell>
                      <TableCell>
                        <CollaborationRowActions
                          collaboration={collaboration}
                          isTarget={collaboration.target_company_id === me.company_id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={collaborationsPage.page}
              pageSize={collaborationsPage.page_size}
              total={collaborationsPage.total}
              search={search}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
