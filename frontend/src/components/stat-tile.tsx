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
    <Card className="group relative overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-[0_10px_30px_rgba(20,70,45,0.07)]">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "text-2xl font-semibold tracking-[-0.035em] tabular-nums sm:text-[1.75rem]",
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
              "flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-accent/70 text-accent-foreground transition-colors group-hover:bg-accent",
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
