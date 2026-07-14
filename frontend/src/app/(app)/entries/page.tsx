import type { Metadata } from "next";
import { HandCoins, ScrollText, Users } from "lucide-react";

import { listEntries, listEntriesPage } from "@/lib/data/entries";
import { listWallets } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/stat-tile";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableSearchForm } from "@/components/data-table/search-form";
import { CreateEntryDialog } from "./create-entry-dialog";
import { EntriesTable } from "./entries-table";

export const metadata: Metadata = { title: "Entrées — D-Transfert" };

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [entriesPage, allEntries, wallets] = await Promise.all([
    listEntriesPage({ page, search, sortBy, sortDir }),
    listEntries(),
    listWallets(),
  ]);
  const entries = entriesPage.items;
  const mergeableEntriesCount = allEntries.filter(
    (entry) => entry.status === "unallocated" || entry.status === "partially_allocated"
  ).length;
  const entriesWithClientCount = allEntries.filter((entry) => entry.client_name && entry.client_phone).length;
  const consumedEntriesCount = allEntries.filter((entry) => entry.status === "consumed").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entrées"
        description="Argent reçu des clients, à transformer en envoi ou en paiement client."
        action={<CreateEntryDialog wallets={wallets} />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Entrées total" value={entriesPage.total} icon={ScrollText} />
        <StatTile
          label="À fusionner"
          value={mergeableEntriesCount}
          icon={Users}
          hint="Disponibles ou partiellement affectées"
        />
        <StatTile
          label="Avec client"
          value={entriesWithClientCount}
          icon={HandCoins}
          hint="Nom et téléphone renseignés"
        />
        <StatTile label="Consommées" value={consumedEntriesCount} tone="success" />
      </section>

      {entriesPage.total === 0 && !search ? (
        <EmptyState message="Aucune entrée enregistrée." />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm
            defaultValue={search}
            sortBy={sortBy}
            sortDir={sortDir}
            placeholder="Rechercher une entrée…"
          />
          <Card className="py-4">
            {entries.length === 0 ? (
              <EmptyState message="Aucune entrée ne correspond à cette recherche." />
            ) : (
              <EntriesTable entries={entries} wallets={wallets} sortBy={sortBy} sortDir={sortDir} search={search} />
            )}
            <DataTablePagination
              page={entriesPage.page}
              pageSize={entriesPage.page_size}
              total={entriesPage.total}
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
