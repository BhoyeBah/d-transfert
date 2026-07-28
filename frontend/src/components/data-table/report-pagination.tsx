import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Variante de DataTablePagination pour une page qui affiche plusieurs tableaux à la fois
 * (le module Rapports) : chaque tableau a son propre paramètre de page (`pageParam`) et
 * conserve tous les autres paramètres d'URL courants (dates, sélecteurs, pages des autres
 * tableaux) au lieu de les écraser.
 */
export function ReportPagination({
  page,
  pageSize,
  total,
  pageParam,
  currentParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  pageParam: string;
  currentParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(currentParams)) {
      if (value && key !== pageParam) params.set(key, value);
    }
    if (targetPage > 1) params.set(pageParam, String(targetPage));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
      <p className="text-xs text-muted-foreground">
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
        <span className="text-xs text-muted-foreground">
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
