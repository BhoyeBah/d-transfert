import type { LucideIcon } from "lucide-react";

export function EmptyState({
  message,
  title,
  icon: Icon,
  action,
}: {
  message: string;
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/25 px-6 py-12 text-center shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
        Aucun contenu
      </div>
      {Icon && (
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {action}
    </div>
  );
}
