import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SortDir } from "@/lib/data-table";

export function DataTablePagination({
  page,
  pageSize,
  total,
  search,
  sortBy,
  sortDir,
}: {
  page: number;
  pageSize: number;
  total: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDir;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sortBy) params.set("sort_by", sortBy);
    if (sortDir) params.set("sort_dir", sortDir);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? "Aucun résultat" : `${from}–${to} sur ${total}`}
      </p>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="size-4" />
            Précédent
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(page - 1)}>
              <ChevronLeft className="size-4" />
              Précédent
            </Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        {page >= totalPages ? (
          <Button variant="outline" size="sm" disabled>
            Suivant
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(page + 1)}>
              Suivant
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
