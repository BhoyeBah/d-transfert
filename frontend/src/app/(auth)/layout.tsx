import Link from "next/link";
import { ArrowRight, ShieldCheck, SplitSquareHorizontal, WalletCards } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-border/60 bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(45,212,191,0.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))]" />
        <div className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-base font-bold text-white shadow-lg shadow-black/20 backdrop-blur">
              D
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/90">
              Console professionnelle
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Un design qui inspire la rigueur, la lisibilité et le contrôle.
            </h1>
            <p className="max-w-lg text-base leading-7 text-white/72">
              Des wallets, des collaborations, des envois, des rapports et des validations, le tout
              dans un cadre visuel plus net et plus crédible.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <WalletCards className="mb-3 size-5 text-cyan-300" />
              <div className="text-sm font-medium">Wallets</div>
              <div className="mt-1 text-xs leading-5 text-white/60">
                Lecture rapide des soldes et des mouvements.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <SplitSquareHorizontal className="mb-3 size-5 text-cyan-300" />
              <div className="text-sm font-medium">Collaborations</div>
              <div className="mt-1 text-xs leading-5 text-white/60">
                Taux, validations et historique centralisés.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <ShieldCheck className="mb-3 size-5 text-cyan-300" />
              <div className="text-sm font-medium">Traçabilité</div>
              <div className="mt-1 text-xs leading-5 text-white/60">
                Chaque action reste visible et auditée.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Expérience utilisateur
                </div>
                <div className="mt-1 text-lg font-medium">Plus claire, plus crédible, plus dense.</div>
              </div>
              <ArrowRight className="size-5 text-cyan-300" />
            </div>
          </div>
        </div>

        <div className="relative flex items-end justify-between gap-4 text-xs text-white/45">
          <p>© {new Date().getFullYear()} D-Transfert</p>
          <p>Gestion multi-entreprises, en production web.</p>
        </div>
      </div>

      <div className="flex flex-col justify-between px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              D
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight">D-Transfert</div>
              <div className="text-xs text-muted-foreground">Suite financière multi-entreprises</div>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:p-8">
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
