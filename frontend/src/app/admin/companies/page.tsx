import type { Metadata } from "next";

import { listAdminCompanies } from "@/lib/data/admin";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CompaniesTable } from "./companies-table";

export const metadata: Metadata = { title: "Entreprises — Administration D-Transfert" };

export default async function AdminCompaniesPage() {
  const companies = await listAdminCompanies();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entreprises"
        description={`${companies.length} entreprise${companies.length > 1 ? "s" : ""} inscrite${companies.length > 1 ? "s" : ""} sur la plateforme.`}
      />

      <Card>
        <CardContent>
          <CompaniesTable companies={companies} />
        </CardContent>
      </Card>
    </div>
  );
}
