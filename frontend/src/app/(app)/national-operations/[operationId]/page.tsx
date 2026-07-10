import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getNationalOperation } from "@/lib/data/national-operations";
import { listWallets } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { nationalOperationTypeLabels } from "@/lib/validation/national-operations";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CancelOperationButton } from "./cancel-button";

export const metadata: Metadata = { title: "Détail opération — D-Transfert" };

export default async function NationalOperationDetailPage({
  params,
}: {
  params: Promise<{ operationId: string }>;
}) {
  const { operationId } = await params;
  const [operation, wallets] = await Promise.all([getNationalOperation(operationId), listWallets()]);
  const walletNameById = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));
  const balanceSummaries = Object.entries(
    operation.lines.reduce<Record<string, { in: number; out: number }>>((acc, line) => {
      const current = acc[line.currency] ?? { in: 0, out: 0 };
      current.in += Number(line.amount_in);
      current.out += Number(line.amount_out);
      acc[line.currency] = current;
      return acc;
    }, {})
  ).map(([currency, summary]) => ({ currency, ...summary, gap: summary.in - summary.out }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/national-operations"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Opérations nationales
        </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-mono text-lg font-semibold tracking-tight">{operation.reference}</h1>
              <p className="text-sm text-muted-foreground">
              {nationalOperationTypeLabels[operation.type as keyof typeof nationalOperationTypeLabels] ??
                operation.type} ·{" "}
              {formatDate(operation.created_at)}
              </p>
            </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={operation.status} />
            {operation.status === "validated" && <CancelOperationButton operationId={operation.id} />}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Équilibre</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceSummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun total à afficher.</p>
          ) : (
            <div className="grid gap-2">
              {balanceSummaries.map((summary) => (
                <div key={summary.currency} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{summary.currency}</span>
                  <span className="tabular-nums text-success">Entrées {summary.in.toFixed(2)}</span>
                  <span className="tabular-nums text-destructive">Sorties {summary.out.toFixed(2)}</span>
                  <span className={summary.gap === 0 ? "text-success" : "text-warning"}>
                    Écart {summary.gap.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lignes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead className="text-right">Entrée</TableHead>
                <TableHead className="text-right">Sortie</TableHead>
                <TableHead className="text-right">Solde après</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operation.lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {walletNameById.has(line.wallet_id) ? (
                      <Link href={`/wallets/${line.wallet_id}`} className="hover:underline">
                        {walletNameById.get(line.wallet_id)}
                      </Link>
                    ) : (
                      line.wallet_id.slice(0, 8)
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-success">
                    {Number(line.amount_in) > 0 ? formatMoney(line.amount_in, line.currency) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">
                    {Number(line.amount_out) > 0 ? formatMoney(line.amount_out, line.currency) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {line.balance_after ? formatMoney(line.balance_after, line.currency) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{line.note ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
