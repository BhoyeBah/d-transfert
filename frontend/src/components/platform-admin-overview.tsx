import Link from "next/link";
import { Building2, Settings2, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export function PlatformAdminOverview() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Plateforme"
        title="Espace Super Admin"
        description="Vue d'ensemble de la plateforme. Ce compte n'est lié à aucune entreprise."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
          <CardHeader className="space-y-3">
            <ShieldCheck className="size-5 text-primary" />
            <CardTitle className="text-base">Accès plateforme</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gère les entreprises, consulte les journaux d&apos;audit et supervise les accès globaux
            depuis les routes d&apos;administration.
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-primary" />
          <CardHeader className="space-y-3">
            <Users className="size-5 text-primary" />
            <CardTitle className="text-base">Connexion</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Matricule de connexion:{" "}
            <span className="font-medium text-foreground">MAT-AD-001</span>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-cyan-400" />
          <CardHeader className="space-y-3">
            <Settings2 className="size-5 text-primary" />
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Link href="/dashboard" className="font-medium text-foreground hover:underline">
              Ouvrir le tableau de bord plateforme
            </Link>
            <Link href="/notifications" className="font-medium text-foreground hover:underline">
              Voir les notifications
            </Link>
            <Link href="/admin" className="font-medium text-foreground hover:underline">
              Explorer les paramètres avancés
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur">
          <div className="h-1 bg-gradient-to-r from-primary via-cyan-400 to-emerald-400" />
          <CardHeader>
            <CardTitle className="text-base">Plateforme supervisée</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <Building2 className="mb-3 size-5 text-primary" />
              <div className="text-sm font-medium text-foreground">Entreprises</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Administration centralisée des comptes, statuts et paramètres.
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <ShieldCheck className="mb-3 size-5 text-primary" />
              <div className="text-sm font-medium text-foreground">Traçabilité</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Chaque action sensible remonte dans les journaux d&apos;audit.
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(180deg,hsl(173_68%_27%_/_0.08),transparent)] shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Positionnement produit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              L&apos;interface doit parler le langage d&apos;une plateforme de suivi financier:
              hiérarchie nette, métriques lisibles, actions clairement groupées.
            </p>
            <p>
              Cette version donne plus de densité visuelle sans casser les habitudes de navigation.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
