import Link from "next/link";
import { ArrowRight, ShieldCheck, SplitSquareHorizontal, WalletCards } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
      <div className="relative hidden overflow-hidden border-r border-sidebar-border bg-sidebar px-10 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(110,190,145,0.17),transparent_30%),linear-gradient(160deg,transparent_40%,rgba(0,0,0,0.22))]" />
        <div className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
            <span className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              DT
            </span>
            <span>
              <span className="block text-base">D-Transfert</span>
              <span className="block text-xs font-normal text-white/60">
                Suite financière multi-entreprises
              </span>
            </span>
          </Link>
        </div>

        <div className="relative my-auto max-w-xl space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sidebar-primary">
              Gestion financière structurée
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.035em] text-balance">
              Vos opérations financières, clairement maîtrisées.
            </h1>
            <p className="max-w-lg text-base leading-7 text-white/72">
              Des wallets, des collaborations, des envois, des rapports et des validations, le tout
              dans un cadre visuel plus net et plus crédible.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-t border-white/12 py-4">
              <WalletCards className="mb-3 size-5 text-sidebar-primary" />
              <div className="text-sm font-medium">Wallets</div>
              <div className="mt-1 text-xs leading-5 text-white/60">
                Lecture rapide des soldes et des mouvements.
              </div>
            </div>
            <div className="border-t border-white/12 py-4">
              <SplitSquareHorizontal className="mb-3 size-5 text-sidebar-primary" />
              <div className="text-sm font-medium">Collaborations</div>
              <div className="mt-1 text-xs leading-5 text-white/60">
                Taux, validations et historique centralisés.
              </div>
            </div>
            <div className="border-t border-white/12 py-4">
              <ShieldCheck className="mb-3 size-5 text-sidebar-primary" />
              <div className="text-sm font-medium">Traçabilité</div>
              <div className="mt-1 text-xs leading-5 text-white/60">
                Chaque action reste visible et auditée.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Expérience utilisateur
                </div>
                <div className="mt-1 text-lg font-medium">Plus claire, plus crédible, plus dense.</div>
              </div>
              <ArrowRight className="size-5 text-sidebar-primary" />
            </div>
          </div>
        </div>

        <div className="relative flex items-end justify-between gap-4 text-xs text-white/45">
          <p>© {new Date().getFullYear()} D-Transfert</p>
          <p>Gestion multi-entreprises, en production web.</p>
        </div>
      </div>

      <div className="flex flex-col justify-between px-5 py-8 sm:px-8 lg:px-14">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              DT
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight">D-Transfert</div>
              <div className="text-xs text-muted-foreground">Suite financière multi-entreprises</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_18px_55px_rgba(25,50,35,0.08)] sm:p-8">
            {children}
          </div>
        </div>
        <p className="mx-auto w-full max-w-md text-xs text-muted-foreground">
          © {new Date().getFullYear()} D-Transfert. Plateforme de gestion multi-entreprises.
        </p>
      </div>
    </div>
  );
}
