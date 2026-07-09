import type { Metadata } from "next";
import Link from "next/link";

import { listNationalOperations } from "@/lib/data/national-operations";
import { listWallets } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { nationalOperationTypeLabels } from "@/lib/validation/national-operations";
import type { NationalOperation } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateOperationDialog } from "./create-operation-dialog";

export const metadata: Metadata = { title: "Opérations nationales — D-Transfert" };

function operationAmountByCurrency(operation: NationalOperation): string {
  const totals = new Map<string, number>();
  for (const line of operation.lines) {
    const amountIn = Number(line.amount_in);
    if (amountIn > 0) {
      totals.set(line.currency, (totals.get(line.currency) ?? 0) + amountIn);
    }
  }
  if (totals.size === 0) return "—";
  return Array.from(totals.entries())
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" · ");
}

export default async function NationalOperationsPage() {
  const [operations, wallets] = await Promise.all([listNationalOperations(), listWallets()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Opérations nationales"
        description="Dépôts, retraits, échanges et rééquilibrages entre wallets — sans frais."
        action={<CreateOperationDialog wallets={wallets} />}
      />

      {operations.length === 0 ? (
        <EmptyState message="Aucune opération enregistrée." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Client (téléphone)</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/national-operations/${operation.id}`} className="hover:underline">
                      {operation.reference}
                    </Link>
                  </TableCell>
                  <TableCell>{nationalOperationTypeLabels[operation.type as "deposit"] ?? operation.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={operation.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {operation.client_name ? (
                      <>
                        {operation.client_name}
                        {operation.client_phone && (
                          <span className="text-xs"> ({operation.client_phone})</span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {operationAmountByCurrency(operation)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(operation.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
