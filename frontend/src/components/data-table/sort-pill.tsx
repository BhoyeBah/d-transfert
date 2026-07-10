import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SortDir } from "@/lib/data-table";

export function SortPill({
  column,
  label,
  currentSort,
  currentDir,
  search,
}: {
  column: string;
  label: string;
  currentSort?: string;
  currentDir?: SortDir;
  search?: string;
}) {
  const isActive = currentSort === column;
  const nextDir: SortDir = isActive && currentDir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("sort_by", column);
  params.set("sort_dir", nextDir);
  const Icon = isActive ? (currentDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <Link
      href={`?${params.toString()}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
        isActive
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-input text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <Icon className="size-3" />
    </Link>
  );
}
