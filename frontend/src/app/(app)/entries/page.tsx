import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listEntriesPage } from "@/lib/data/entries";
import { listWallets } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
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
  const [entriesPage, wallets, collaborations] = await Promise.all([
    listEntriesPage({ page, search, sortBy, sortDir }),
    listWallets(),
    listCollaborations(),
  ]);
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entrées"
        description="Argent reçu des clients, à transformer en envoi ou en paiement collaborateur."
        action={<CreateEntryDialog wallets={wallets} />}
      />

      {entriesPage.total === 0 && !search ? (
        <EmptyState
          icon={ScrollText}
          title="Aucune entrée"
          message="Enregistrez l'argent reçu d'un client pour ensuite le transformer en envoi ou en paiement collaborateur."
          action={<CreateEntryDialog wallets={wallets} />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm
            defaultValue={search}
            sortBy={sortBy}
            sortDir={sortDir}
            placeholder="Rechercher une entrée…"
          />
          <Card className="py-4">
            {entriesPage.items.length === 0 ? (
              <EmptyState message="Aucune entrée ne correspond à cette recherche." />
            ) : (
              <EntriesTable
                entries={entriesPage.items}
                collaborations={acceptedCollaborations}
                wallets={wallets}
                sortBy={sortBy}
                sortDir={sortDir}
                search={search}
              />
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
