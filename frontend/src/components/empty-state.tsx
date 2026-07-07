import type { LucideIcon } from "lucide-react";

export function EmptyState({
  message,
  title,
  icon: Icon,
  action,
}: {
  /** Kept for backward compatibility: used as the description when no `title` is given. */
  message: string;
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
      {Icon && (
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </div>
      )}
      <div className="flex flex-col gap-1 px-6">
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {action}
    </div>
  );
}
