import type { Metadata } from "next";

import { listAdminSystemLogsPage } from "@/lib/data/admin";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
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

export const metadata: Metadata = { title: "Logs système — Administration D-Transfert" };

export default async function AdminSystemLogsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const logsPage = await listAdminSystemLogsPage({ page, search, sortBy, sortDir });
  const logs = logsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Logs système"
        description="Erreurs applicatives et événements de sécurité (tentatives de connexion, verrouillages), distincts du journal d'audit métier."
      />

      <DataTableSearchForm
        defaultValue={search}
        sortBy={sortBy}
        sortDir={sortDir}
        placeholder="Rechercher par source ou message…"
      />

      <Card className="py-0">
        {logs.length === 0 ? (
          <CardContent>
            <EmptyState
              message={
                logsPage.total === 0 && !search
                  ? "Aucun événement système enregistré."
                  : "Aucun résultat pour cette recherche."
              }
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="level" label="Niveau" currentSort={sortBy} currentDir={sortDir} search={search} />
                <SortableHeader column="source" label="Source" currentSort={sortBy} currentDir={sortDir} search={search} />
                <TableHead>Message</TableHead>
                <SortableHeader column="created_at" label="Date" currentSort={sortBy} currentDir={sortDir} search={search} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <StatusBadge status={log.level} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.source}</TableCell>
                  <TableCell className="max-w-md truncate text-sm text-muted-foreground" title={log.message}>
                    {log.message}
                  </TableCell>
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
