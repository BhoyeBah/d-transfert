import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listEntries } from "@/lib/data/entries";
import { listWallets } from "@/lib/data/wallets";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { CreateEntryDialog } from "./create-entry-dialog";
import { EntriesTable } from "./entries-table";

export const metadata: Metadata = { title: "Entrées — D-Transfert" };

export default async function EntriesPage() {
  const [entries, wallets, collaborations] = await Promise.all([
    listEntries(),
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

      {entries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Aucune entrée"
          message="Enregistrez l'argent reçu d'un client pour ensuite le transformer en envoi ou en paiement collaborateur."
          action={<CreateEntryDialog wallets={wallets} />}
        />
      ) : (
        <Card className="py-4">
          <EntriesTable entries={entries} collaborations={acceptedCollaborations} wallets={wallets} />
        </Card>
      )}
    </div>
  );
}
