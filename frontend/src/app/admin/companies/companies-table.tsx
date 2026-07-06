"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { CompanyMe } from "@/types/api";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyStatusActions } from "./company-status-actions";

export function CompaniesTable({ companies }: { companies: CompanyMe[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) =>
      [company.name, company.registration_code, company.phone].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [companies, search]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Rechercher par nom, code d'inscription ou téléphone…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={companies.length === 0 ? "Aucune entreprise inscrite." : "Aucun résultat pour cette recherche."}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Code d&apos;inscription</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Devise par défaut</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((company) => (
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
      )}
    </div>
  );
}
