import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SortDir } from "@/lib/data-table";

export function DataTableSearchForm({
  defaultValue,
  sortBy,
  sortDir,
  placeholder = "Rechercher…",
}: {
  defaultValue?: string;
  sortBy?: string;
  sortDir?: SortDir;
  placeholder?: string;
}) {
  return (
    <form method="get" className="flex items-center gap-2">
      {sortBy ? <input type="hidden" name="sort_by" value={sortBy} /> : null}
      {sortDir ? <input type="hidden" name="sort_dir" value={sortDir} /> : null}
      <Input
        type="search"
        name="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-9 max-w-xs"
      />
      <Button type="submit" variant="outline" size="sm">
        <SearchIcon />
        Rechercher
      </Button>
    </form>
  );
}
