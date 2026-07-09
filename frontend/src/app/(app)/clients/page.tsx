import type { Metadata } from "next";
import Link from "next/link";

import { listClientsPage } from "@/lib/data/clients";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
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
import { CreateClientDialog } from "./create-client-dialog";

export const metadata: Metadata = { title: "Clients — D-Transfert" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const clientsPage = await listClientsPage({ page, search, sortBy, sortDir });
  const clients = clientsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clients"
        description="Clients avec un solde de dette suite à un manquant sur entrée."
        action={<CreateClientDialog />}
      />

      {clientsPage.total === 0 && !search ? (
        <EmptyState message="Aucun client enregistré." action={<CreateClientDialog />} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm defaultValue={search} sortBy={sortBy} sortDir={sortDir} placeholder="Rechercher un client…" />
          <Card className="py-0">
            {clients.length === 0 ? (
              <EmptyState message="Aucun client ne correspond à cette recherche." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader column="name" label="Nom" currentSort={sortBy} currentDir={sortDir} search={search} />
                    <TableHead>Téléphone</TableHead>
                    <SortableHeader
                      column="balance"
                      label="Solde (dette)"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      search={search}
                      className="text-right"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <Link href={`/clients/${client.id}`} className="hover:underline">
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{client.phone}</TableCell>
                      <TableCell
                        className={`text-right font-medium tabular-nums ${
                          Number(client.balance) > 0 ? "text-destructive" : ""
                        }`}
                      >
                        {formatMoney(client.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={clientsPage.page}
              pageSize={clientsPage.page_size}
              total={clientsPage.total}
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
