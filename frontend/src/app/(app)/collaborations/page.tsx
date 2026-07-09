import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { getCompanyMe } from "@/lib/data/company";
import { listCollaborationsPage } from "@/lib/data/collaborations";
import { getMe } from "@/lib/data/me";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
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

export const metadata: Metadata = { title: "Collaborations — D-Transfert" };

export default async function CollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [collaborationsPage, company, me] = await Promise.all([
    listCollaborationsPage({ page, search, sortBy, sortDir }),
    getCompanyMe(),
    getMe(),
  ]);
  const collaborations = collaborationsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Collaborations"
        description="Entreprises partenaires pour les envois internationaux."
        action={<RequestCollaborationDialog defaultCurrency={company.default_currency} />}
      />

      {collaborationsPage.total === 0 && !search ? (
        <EmptyState
          icon={Building2}
          title="Aucune collaboration"
          message="Envoyez une demande à une entreprise partenaire par son matricule pour commencer à échanger des envois internationaux."
          action={<RequestCollaborationDialog defaultCurrency={company.default_currency} />}
        />
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
                    <TableHead>Entreprise</TableHead>
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
                    <SortableHeader
                      column="created_at"
                      label="Date"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborations.map((collaboration) => (
                    <TableRow key={collaboration.id}>
                      <TableCell>
                        <Link href={`/collaborations/${collaboration.id}`} className="font-medium hover:underline">
                          {collaboration.counterparty_company_name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">
                          {collaboration.counterparty_company_matricule}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {collaboration.initiator_company_id === me.company_id ? "Initiateur" : "Sollicité"}
                      </TableCell>
                      <TableCell>{collaboration.currency}</TableCell>
                      <TableCell>
                        <StatusBadge status={collaboration.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {collaboration.current_rate ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(collaboration.created_at)}
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
