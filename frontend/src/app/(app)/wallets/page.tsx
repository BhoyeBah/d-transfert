import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Landmark, Smartphone, Wallet as WalletIcon, type LucideIcon } from "lucide-react";

import { getCompanyMe } from "@/lib/data/company";
import { listWalletsPage } from "@/lib/data/wallets";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { walletTypeLabels } from "@/lib/validation/wallets";
import type { WalletType } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { WalletBalanceToggle } from "@/components/wallet-balance-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableSearchForm } from "@/components/data-table/search-form";
import { SortPill } from "@/components/data-table/sort-pill";
import { CreateWalletDialog } from "./create-wallet-dialog";

export const metadata: Metadata = { title: "Wallets — D-Transfert" };

const WALLET_TYPE_ICONS: Record<WalletType, LucideIcon> = {
  cash: Banknote,
  mobile_money: Smartphone,
  bank: Landmark,
  other: WalletIcon,
};

export default async function WalletsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [walletsPage, company] = await Promise.all([
    listWalletsPage({ page, search, sortBy, sortDir }),
    getCompanyMe(),
  ]);
  const wallets = walletsPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallets"
        description="Comptes de trésorerie de votre entreprise."
        action={<CreateWalletDialog defaultCurrency={company.default_currency} />}
      />

      {walletsPage.total === 0 && !search ? (
        <EmptyState
          icon={WalletIcon}
          title="Aucun wallet"
          message="Créez votre premier wallet (cash, mobile money, banque) pour commencer à enregistrer vos opérations."
          action={<CreateWalletDialog defaultCurrency={company.default_currency} />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DataTableSearchForm defaultValue={search} sortBy={sortBy} sortDir={sortDir} placeholder="Rechercher un wallet…" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Trier par</span>
              <SortPill column="name" label="Nom" currentSort={sortBy} currentDir={sortDir} search={search} />
              <SortPill column="balance" label="Solde" currentSort={sortBy} currentDir={sortDir} search={search} />
              <SortPill column="created_at" label="Date" currentSort={sortBy} currentDir={sortDir} search={search} />
            </div>
          </div>

          {wallets.length === 0 ? (
            <EmptyState message="Aucun wallet ne correspond à cette recherche." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wallets.map((wallet) => {
                const Icon = WALLET_TYPE_ICONS[wallet.type];
                return (
                  <Card key={wallet.id} className="flex flex-col gap-4 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="font-medium leading-tight">{wallet.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{wallet.code}</p>
                        </div>
                      </div>
                      <StatusBadge status={wallet.status} />
                    </div>

                    <p className="text-xs text-muted-foreground">{walletTypeLabels[wallet.type]}</p>

                    <WalletBalanceToggle value={wallet.balance} currency={wallet.currency} />

                    <Button variant="outline" size="sm" className="mt-auto self-start" asChild>
                      <Link href={`/wallets/${wallet.id}`}>Détail</Link>
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="py-0">
            <DataTablePagination
              page={walletsPage.page}
              pageSize={walletsPage.page_size}
              total={walletsPage.total}
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
