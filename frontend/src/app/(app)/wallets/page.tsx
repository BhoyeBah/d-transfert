import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Landmark, Smartphone, Wallet as WalletIcon, type LucideIcon } from "lucide-react";

import { getCompanyMe } from "@/lib/data/company";
import { listWallets } from "@/lib/data/wallets";
import { walletTypeLabels } from "@/lib/validation/wallets";
import type { WalletType } from "@/types/api";
import { AmountDisplay } from "@/components/amount-display";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateWalletDialog } from "./create-wallet-dialog";

export const metadata: Metadata = { title: "Wallets — D-Transfert" };

const WALLET_TYPE_ICONS: Record<WalletType, LucideIcon> = {
  cash: Banknote,
  mobile_money: Smartphone,
  bank: Landmark,
  other: WalletIcon,
};

export default async function WalletsPage() {
  const [wallets, company] = await Promise.all([listWallets(), getCompanyMe()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallets"
        description="Comptes de trésorerie de votre entreprise."
        action={<CreateWalletDialog defaultCurrency={company.default_currency} />}
      />

      {wallets.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="Aucun wallet"
          message="Créez votre premier wallet (cash, mobile money, banque) pour commencer à enregistrer vos opérations."
          action={<CreateWalletDialog defaultCurrency={company.default_currency} />}
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => {
                const Icon = WALLET_TYPE_ICONS[wallet.type];
                return (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        {wallet.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{wallet.code}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {walletTypeLabels[wallet.type]}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={wallet.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <AmountDisplay value={wallet.balance} currency={wallet.currency} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/wallets/${wallet.id}`}>Détail</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
