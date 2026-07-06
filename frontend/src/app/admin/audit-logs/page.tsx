import type { Metadata } from "next";

import { listAdminAuditLogs } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Journal d'audit — Administration D-Transfert" };

const MAX_ROWS = 200;

export default async function AdminAuditLogsPage() {
  const auditLogs = await listAdminAuditLogs();
  const sorted = [...auditLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const rows = sorted.slice(0, MAX_ROWS);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Journal d'audit"
        description={`Actions sensibles sur toutes les entreprises, du plus récent au plus ancien${
          sorted.length > MAX_ROWS ? ` (${MAX_ROWS} dernières entrées sur ${sorted.length})` : ""
        }.`}
      />

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState message="Aucune action enregistrée." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.entity_type}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.company_id ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.note ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
