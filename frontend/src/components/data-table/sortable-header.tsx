import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/lib/data-table";

export function SortableHeader({
  column,
  label,
  currentSort,
  currentDir,
  search,
  className,
}: {
  column: string;
  label: string;
  currentSort?: string;
  currentDir?: SortDir;
  search?: string;
  className?: string;
}) {
  const isActive = currentSort === column;
  const nextDir: SortDir = isActive && currentDir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("sort_by", column);
  params.set("sort_dir", nextDir);
  const Icon = isActive ? (currentDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <Link
        href={`?${params.toString()}`}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </Link>
    </TableHead>
  );
}
