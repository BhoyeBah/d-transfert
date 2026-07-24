export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[1.75rem]">{title}</h1>
          {description && <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="sm:self-start">{action}</div>}
    </div>
  );
}
