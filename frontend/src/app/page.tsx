import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "D-Transfert",
  description:
    "Plateforme professionnelle de gestion multi-entreprises pour wallets, collaborations, opérations et rapports.",
};

const highlights = [
  {
    title: "Soldes lisibles",
    description: "Une vue claire des wallets, des dettes et des validations en cours.",
    icon: Wallet,
  },
  {
    title: "Collaborations cadrées",
    description: "Taux, validations et historique dans un seul flux de travail.",
    icon: ShieldCheck,
  },
  {
    title: "Pilotage en temps réel",
    description: "Des métriques, alertes et rapports pensés pour les équipes terrain.",
    icon: BarChart3,
  },
];

const assurances = [
  "Mouvements traçables de bout en bout",
  "Accès par rôles et permissions",
  "Dashboard, rapports et audit centralisés",
  "Interface web responsive prête pour l’exploitation",
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(173_68%_85%_/_0.25),transparent_30%),radial-gradient(circle_at_top_right,hsl(199_68%_85%_/_0.18),transparent_26%),linear-gradient(180deg,hsl(200_20%_99%),hsl(200_18%_96%))] dark:bg-[radial-gradient(circle_at_top_left,hsl(173_55%_25%_/_0.25),transparent_30%),radial-gradient(circle_at_top_right,hsl(199_55%_25%_/_0.18),transparent_26%),linear-gradient(180deg,hsl(200_22%_8%),hsl(200_22%_6%))]" />
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-border/70 bg-background/70 px-4 py-3 shadow-sm backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              D
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold tracking-tight">D-Transfert</span>
              <span className="block text-xs text-muted-foreground">
                Gestion financière multi-entreprises
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/register">
                Créer un compte
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <Sparkles className="size-4" />
              Console professionnelle
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                La couche visuelle qu&apos;une plateforme financière sérieuse mérite.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                D-Transfert centralise wallets, collaborations, envois, paiements, rapports et
                audit dans une interface pensée pour la lisibilité, la confiance et l&apos;exécution
                rapide.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/register">
                  Démarrer maintenant
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
                <Link href="/login">Accéder à l&apos;espace de travail</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="border-border/70 bg-card/85 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <CardHeader className="space-y-3 p-5">
                      <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="-mt-2 px-5 pb-5 text-sm text-muted-foreground">
                      {item.description}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[linear-gradient(135deg,hsl(173_68%_35%_/_0.16),transparent_45%),linear-gradient(315deg,hsl(199_68%_48%_/_0.12),transparent_38%)] blur-2xl" />
            <div className="rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_28px_90px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-6">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Aperçu produit
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      Une interface dense, mais jamais confuse.
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-2 text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      En attente
                    </div>
                    <div className="text-sm font-semibold text-warning">12 opérations</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Solde principal</div>
                      <Clock3 className="size-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                      128 450 GNF
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Vue consolidée du jour</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Traçabilité</div>
                      <CheckCircle2 className="size-4 text-success" />
                    </div>
                    <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                      100%
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Actions historisées</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border/70 bg-[linear-gradient(180deg,hsl(173_68%_30%_/_0.06),transparent)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    Ce que la plateforme couvre
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {assurances.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border/70 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Conçu pour des équipes qui gèrent du volume, des validations et de la traçabilité.</p>
          <p>Interface web responsive. Auth, dashboard et workflows métiers intégrés.</p>
        </footer>
      </section>
    </main>
  );
}
