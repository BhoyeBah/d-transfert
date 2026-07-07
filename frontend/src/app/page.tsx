import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  FileClock,
  HandCoins,
  Landmark,
  Layers,
  Paperclip,
  ScrollText,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "D-Transfert — Gestion des transferts d'argent entre entreprises",
  description:
    "Wallets, opérations nationales, envois internationaux, paiements collaborateurs et preuves : centralisez vos transferts d'argent entre entreprises partenaires dans une seule plateforme claire et sécurisée.",
};

const FEATURES = [
  {
    icon: Wallet,
    title: "Wallets",
    description: "Cash, mobile money, banque : suivez le solde réel de chaque caisse en temps réel.",
  },
  {
    icon: ScrollText,
    title: "Entrées",
    description: "Enregistrez l'argent reçu d'un client, puis transformez-le en envoi ou en paiement.",
  },
  {
    icon: ArrowLeftRight,
    title: "Envois internationaux",
    description: "Envoyez vers un collaborateur avec taux privé et taux collaboratif clairement séparés.",
  },
  {
    icon: HandCoins,
    title: "Paiements collaborateurs",
    description: "Réglez une dette entre partenaires et suivez l'impact sur le solde partagé.",
  },
  {
    icon: Building2,
    title: "Collaborations",
    description: "Un solde partagé et transparent avec chaque entreprise partenaire, sans ambiguïté.",
  },
  {
    icon: Paperclip,
    title: "Preuves",
    description: "Justifiez chaque opération avec une pièce jointe rattachée à l'envoi ou au paiement.",
  },
  {
    icon: FileClock,
    title: "Rapports & audit",
    description: "Rapport journalier et journal d'audit pour ne jamais perdre la trace d'une action.",
  },
  {
    icon: ShieldCheck,
    title: "Rôles & permissions",
    description: "Chaque employé n'accède qu'à ce qui le concerne, avec des actions historisées.",
  },
];

const STEPS = [
  {
    title: "Enregistrez",
    description: "Un dépôt, un wallet, une entrée d'argent reçu d'un client — tout est tracé dès le départ.",
  },
  {
    title: "Transformez",
    description: "L'entrée devient un envoi vers un collaborateur ou un paiement de dette, en un geste.",
  },
  {
    title: "Suivez",
    description: "Statut, validation, solde partagé et historique complet, consultables à tout moment.",
  },
];

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect(session.isSuperAdmin ? "/admin" : "/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight whitespace-nowrap"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Landmark className="size-4" />
            </span>
            D-Transfert
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild size="sm" className="sm:h-9">
              <Link href="/register">
                <span className="sm:hidden">S&apos;inscrire</span>
                <span className="hidden sm:inline">Inscrire votre entreprise</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Layers className="size-3.5" />
            Plateforme multi-entreprises
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Un seul endroit pour vos wallets, envois et paiements collaborateurs
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-balance">
            D-Transfert remplace les suivis manuels sur WhatsApp, cahiers et fichiers Excel. Sachez toujours où
            est l&apos;argent, qui doit quoi, et quelle action vous attend.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/register">
                Inscrire votre entreprise
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="py-5">
                <CardContent className="flex flex-col gap-3 px-5">
                  <div className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <feature.icon className="size-4.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Comment ça marche</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Trois étapes pour passer d&apos;un montant reçu à un solde à jour, avec preuve à l&apos;appui.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="flex flex-col gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="overflow-hidden rounded-xl bg-primary">
            <div className="relative flex flex-col items-center gap-4 px-8 py-16 text-center text-primary-foreground">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary-foreground)_12%,transparent),transparent_60%)]" />
              <h2 className="relative max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Prêt à centraliser vos opérations ?
              </h2>
              <p className="relative max-w-md text-sm text-primary-foreground/70">
                Créez le compte de votre entreprise en quelques minutes, un matricule unique vous est attribué
                immédiatement.
              </p>
              <Button size="lg" variant="secondary" asChild className="relative">
                <Link href="/register">
                  Inscrire votre entreprise
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} D-Transfert. Plateforme de gestion multi-entreprises.</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Se connecter
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Inscrire votre entreprise
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
