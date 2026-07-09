import type { Metadata } from "next";

import { listAdminAuditLogsPage } from "@/lib/data/admin";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
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

export const metadata: Metadata = { title: "Journal d'audit — Administration D-Transfert" };

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const logsPage = await listAdminAuditLogsPage({ page, search, sortBy, sortDir });
  const rows = logsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Journal d'audit"
        description="Actions sensibles sur toutes les entreprises, du plus récent au plus ancien."
      />

      <DataTableSearchForm
        defaultValue={search}
        sortBy={sortBy}
        sortDir={sortDir}
        placeholder="Rechercher par action ou entité…"
      />

      <Card className="py-0">
        {rows.length === 0 ? (
          <CardContent>
            <EmptyState
              message={
                logsPage.total === 0 && !search
                  ? "Aucune action enregistrée."
                  : "Aucun résultat pour cette recherche."
              }
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="action" label="Action" currentSort={sortBy} currentDir={sortDir} search={search} />
                <SortableHeader
                  column="entity_type"
                  label="Entité"
                  currentSort={sortBy}
                  currentDir={sortDir}
                  search={search}
                />
                <TableHead>Entreprise</TableHead>
                <TableHead>Note</TableHead>
                <SortableHeader column="created_at" label="Date" currentSort={sortBy} currentDir={sortDir} search={search} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.entity_type}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.company_id ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.note ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DataTablePagination
          page={logsPage.page}
          pageSize={logsPage.page_size}
          total={logsPage.total}
          search={search}
          sortBy={sortBy}
          sortDir={sortDir}
        />
      </Card>
    </div>
  );
}
