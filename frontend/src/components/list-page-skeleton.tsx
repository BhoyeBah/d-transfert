import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ListPageSkeleton({ statTiles = 4, rows = 6 }: { statTiles?: number; rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statTiles }).map((_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
          </Card>
        ))}
      </section>

      <Skeleton className="h-9 w-full max-w-sm" />

      <Card className="py-0">
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
