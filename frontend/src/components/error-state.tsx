import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  error,
  onRetry,
  homeHref = "/dashboard",
  homeLabel = "Retour à l'accueil",
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Une erreur est survenue</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Une erreur inattendue s&apos;est produite. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground/70">Réf. {error.digest}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onRetry}>Réessayer</Button>
        <Button variant="outline" asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
