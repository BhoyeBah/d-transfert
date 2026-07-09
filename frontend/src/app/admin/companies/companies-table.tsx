import Link from "next/link";

import type { CompanyMe } from "@/types/api";
import type { SortDir } from "@/lib/data-table";
import { StatusBadge } from "@/components/status-badge";
import { SortableHeader } from "@/components/data-table/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyStatusActions } from "./company-status-actions";

export function CompaniesTable({
  companies,
  sortBy,
  sortDir,
  search,
}: {
  companies: CompanyMe[];
  sortBy?: string;
  sortDir?: SortDir;
  search?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader column="name" label="Nom" currentSort={sortBy} currentDir={sortDir} search={search} />
          <SortableHeader
            column="registration_code"
            label="Code d'inscription"
            currentSort={sortBy}
            currentDir={sortDir}
            search={search}
          />
          <TableHead>Téléphone</TableHead>
          <TableHead>Devise par défaut</TableHead>
          <SortableHeader column="status" label="Statut" currentSort={sortBy} currentDir={sortDir} search={search} />
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium">
              <Link href={`/admin/companies/${company.id}`} className="hover:underline">
                {company.name}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-xs">{company.registration_code}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{company.phone}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{company.default_currency}</TableCell>
            <TableCell>
              <StatusBadge status={company.status} />
            </TableCell>
            <TableCell>
              <CompanyStatusActions companyId={company.id} status={company.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
