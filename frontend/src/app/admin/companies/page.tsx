import type { Metadata } from "next";

import { listAdminCompaniesPage } from "@/lib/data/admin";
import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableSearchForm } from "@/components/data-table/search-form";
import { CreateCompanyDialog } from "./create-company-dialog";
import { CompaniesTable } from "./companies-table";

export const metadata: Metadata = { title: "Entreprises — Administration D-Transfert" };

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const [companiesPage, settings] = await Promise.all([
    listAdminCompaniesPage({ page, search, sortBy, sortDir }),
    getPublicPlatformSettings(),
  ]);
  const companies = companiesPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entreprises"
        description={`${companiesPage.total} entreprise${companiesPage.total > 1 ? "s" : ""} inscrite${companiesPage.total > 1 ? "s" : ""} sur la plateforme.`}
        action={<CreateCompanyDialog supportedCurrencies={settings.supported_currencies} />}
      />

      <DataTableSearchForm
        defaultValue={search}
        sortBy={sortBy}
        sortDir={sortDir}
        placeholder="Rechercher par nom, code d'inscription ou téléphone…"
      />

      <Card className="py-0">
        {companies.length === 0 ? (
          <CardContent>
            <EmptyState
              message={
                companiesPage.total === 0 && !search
                  ? "Aucune entreprise inscrite."
                  : "Aucun résultat pour cette recherche."
              }
            />
          </CardContent>
        ) : (
          <CompaniesTable companies={companies} sortBy={sortBy} sortDir={sortDir} search={search} />
        )}
        <DataTablePagination
          page={companiesPage.page}
          pageSize={companiesPage.page_size}
          total={companiesPage.total}
          search={search}
          sortBy={sortBy}
          sortDir={sortDir}
        />
      </Card>
    </div>
  );
}
