import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "destructive" | "success";
  hint?: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]",
              tone === "warning" && "text-warning",
              tone === "destructive" && "text-destructive",
              tone === "success" && "text-success"
            )}
          >
            {value}
          </span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-accent/70 text-accent-foreground shadow-sm transition-transform group-hover:scale-105",
              tone === "warning" && "border-warning/20 bg-warning/10 text-warning",
              tone === "destructive" && "border-destructive/20 bg-destructive/10 text-destructive",
              tone === "success" && "border-success/20 bg-success/10 text-success"
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
