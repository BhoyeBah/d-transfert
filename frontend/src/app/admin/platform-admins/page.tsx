import type { Metadata } from "next";

import { listPlatformAdminsPage } from "@/lib/data/admin";
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
import { CreatePlatformAdminDialog } from "./create-platform-admin-dialog";
import { PlatformAdminRowActions } from "./platform-admin-row-actions";

export const metadata: Metadata = { title: "Comptes Super Admin — Administration D-Transfert" };

export default async function AdminPlatformAdminsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const adminsPage = await listPlatformAdminsPage({ page, search, sortBy, sortDir });
  const admins = adminsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Comptes Super Admin"
        description="Comptes disposant d'un accès complet à l'administration de la plateforme."
        action={<CreatePlatformAdminDialog />}
      />

      <DataTableSearchForm
        defaultValue={search}
        sortBy={sortBy}
        sortDir={sortDir}
        placeholder="Rechercher un compte…"
      />

      <Card className="py-0">
        {admins.length === 0 ? (
          <CardContent>
            <EmptyState
              message={
                adminsPage.total === 0 && !search
                  ? "Aucun compte Super Admin."
                  : "Aucun résultat pour cette recherche."
              }
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="full_name" label="Nom" currentSort={sortBy} currentDir={sortDir} search={search} />
                <TableHead>Matricule</TableHead>
                <SortableHeader column="phone" label="Téléphone" currentSort={sortBy} currentDir={sortDir} search={search} />
                <SortableHeader column="created_at" label="Créé le" currentSort={sortBy} currentDir={sortDir} search={search} />
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">{admin.matricule}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{admin.phone}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(admin.created_at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={admin.is_active ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell>
                    <PlatformAdminRowActions admin={admin} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DataTablePagination
          page={adminsPage.page}
          pageSize={adminsPage.page_size}
          total={adminsPage.total}
          search={search}
          sortBy={sortBy}
          sortDir={sortDir}
        />
      </Card>
    </div>
  );
}
