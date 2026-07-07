import Link from "next/link";
import { Landmark } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Landmark className="size-4" />
          </span>
          D-Transfert
        </Link>
        <div className="mx-auto w-full max-w-md py-12">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">{children}</div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} D-Transfert. Plateforme de gestion multi-entreprises.
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary-foreground)_12%,transparent),transparent_60%)]" />
        <div className="flex h-full flex-col justify-end gap-4 p-12 text-primary-foreground">
          <blockquote className="max-w-md text-xl leading-relaxed font-medium text-balance">
            « Un seul solde partagé, des taux clairs, une confiance entre collaborateurs. »
          </blockquote>
          <p className="text-sm text-primary-foreground/70">
            Wallets, opérations nationales, collaborations et envois internationaux — au même endroit.
          </p>
        </div>
      </div>
    </div>
  );
}
