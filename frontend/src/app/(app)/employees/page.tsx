import type { Metadata } from "next";

import { listEmployeesPage } from "@/lib/data/employees";
import { parseDataTableParams, type DataTableSearchParams } from "@/lib/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableSearchForm } from "@/components/data-table/search-form";
import { SortableHeader } from "@/components/data-table/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateEmployeeDialog } from "./create-employee-dialog";
import { EmployeeRowActions } from "./employee-row-actions";

export const metadata: Metadata = { title: "Employés — D-Transfert" };

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const { page, search, sortBy, sortDir } = parseDataTableParams(await searchParams);
  const employeesPage = await listEmployeesPage({ page, search, sortBy, sortDir });
  const employees = employeesPage.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employés"
        description="Comptes employés et leurs permissions."
        action={<CreateEmployeeDialog />}
      />

      {employeesPage.total === 0 && !search ? (
        <EmptyState message="Aucun employé créé." action={<CreateEmployeeDialog />} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTableSearchForm defaultValue={search} sortBy={sortBy} sortDir={sortDir} placeholder="Rechercher un employé…" />
          <Card className="py-0">
            {employees.length === 0 ? (
              <EmptyState message="Aucun employé ne correspond à cette recherche." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader column="full_name" label="Nom" currentSort={sortBy} currentDir={sortDir} search={search} />
                    <TableHead>Matricule</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell className="font-mono text-xs">{employee.matricule}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{employee.phone}</TableCell>
                      <TableCell>
                        <StatusBadge status={employee.is_active ? "active" : "inactive"} />
                      </TableCell>
                      <TableCell>
                        <EmployeeRowActions employee={employee} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <DataTablePagination
              page={employeesPage.page}
              pageSize={employeesPage.page_size}
              total={employeesPage.total}
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
