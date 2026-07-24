import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { getCollaboration, getCollaboratorBalance, getRateHistory } from "@/lib/data/collaborations";
import { getMe } from "@/lib/data/me";
import { listPrivateRates } from "@/lib/data/private-rates";
import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import { formatDate, formatMoney } from "@/lib/format";
import { sendModeLabels } from "@/lib/validation/transfers";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CancelCollaborationButton } from "../cancel-collaboration-button";
import { EditCollaborationDialog } from "../edit-collaboration-dialog";
import {
  CollaborationDecisionButtons,
  ProposeRateDialog,
  RateProposalDecisionButtons,
} from "./collaboration-actions";

export const metadata: Metadata = { title: "Détail collaboration — D-Transfert" };

export default async function CollaborationDetailPage({
  params,
}: {
  params: Promise<{ collaborationId: string }>;
}) {
  const { collaborationId } = await params;
  const [collaboration, rateHistory, me, settings] = await Promise.all([
    getCollaboration(collaborationId),
    getRateHistory(collaborationId),
    getMe(),
    getPublicPlatformSettings(),
  ]);

  const balance = collaboration.status === "accepted" ? await getCollaboratorBalance(collaborationId) : null;
  // Le taux d'envoi privé n'est pas propre à cette collaboration : c'est un réglage par paire de
  // devises (source de l'envoi → destination choisie pour ce bénéficiaire), géré depuis la page
  // "Taux d'envoi", indépendant de la devise de la collaboration elle-même (qui ne sert qu'au
  // solde commun). On affiche ici tous les taux actifs applicables à cette collaboration
  // (globaux ou explicitement liés à elle), quelle que soit leur devise cible.
  const applicableRates =
    collaboration.status === "accepted"
      ? (await listPrivateRates()).filter(
          (rate) => rate.is_active && (rate.collaboration_id === null || rate.collaboration_id === collaborationId)
        )
      : [];

  const isTarget = collaboration.target_company_id === me.company_id;
  const pendingProposal = rateHistory.find((entry) => entry.status === "proposed");
  const canDecideProposal = pendingProposal && pendingProposal.proposed_by_company_id !== me.company_id;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/collaborations"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Collaborations
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Collaboration en {collaboration.currency}
            </h1>
            <p className="text-sm text-muted-foreground">
              {collaboration.counterparty_company_name} · {collaboration.counterparty_company_matricule}
            </p>
            <p className="text-sm text-muted-foreground">{collaboration.note ?? "Aucune note."}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={collaboration.status} />
            {collaboration.status === "pending" && isTarget && (
              <CollaborationDecisionButtons collaborationId={collaboration.id} />
            )}
            {collaboration.status === "pending" && !isTarget && (
              <>
                <EditCollaborationDialog
                  collaboration={collaboration}
                  supportedCurrencies={settings.supported_currencies}
                />
                <CancelCollaborationButton collaborationId={collaboration.id} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="py-4">
          <CardContent className="px-4">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Entreprise partenaire
            </span>
            <p className="text-lg font-semibold">{collaboration.counterparty_company_name}</p>
            <p className="text-sm text-muted-foreground">Matricule {collaboration.counterparty_company_matricule}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="px-4">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Mon rôle
            </span>
            <p className="text-lg font-semibold">
              {collaboration.initiator_company_id === me.company_id ? "Initiateur" : "Sollicité"}
            </p>
            <p className="text-sm text-muted-foreground">
              {collaboration.initiator_company_id === me.company_id
                ? "Vous avez initié cette collaboration."
                : "Votre entreprise a été sollicitée."}
            </p>
          </CardContent>
        </Card>
      </div>

      {collaboration.status === "accepted" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="py-4">
            <CardContent className="px-4">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Solde collaborateur
              </span>
              {balance && (() => {
                const amount = Number(balance.balance);
                const isDebt = amount < 0;
                const isZero = amount === 0;
                return (
                  <>
                    <p
                      className={`text-2xl font-semibold tabular-nums ${
                        isDebt ? "text-destructive" : isZero ? "" : "text-success"
                      }`}
                    >
                      {formatMoney(Math.abs(amount), balance.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isZero
                        ? "Aucun solde en cours."
                        : isDebt
                          ? `Vous devez ${collaboration.counterparty_company_name}.`
                          : `${collaboration.counterparty_company_name} vous doit.`}
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-center justify-between px-4">
              <div>
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Taux collaboratif actuel
                </span>
                <p className="text-2xl font-semibold tabular-nums">{collaboration.current_rate}</p>
              </div>
              {!pendingProposal && <ProposeRateDialog collaborationId={collaboration.id} />}
            </CardContent>
          </Card>
        </div>
      )}

      {pendingProposal && (
        <Card className="border-warning/40">
          <CardContent className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm font-medium">
                Proposition en cours : nouveau taux {pendingProposal.new_rate}
              </span>
              {pendingProposal.note && (
                <p className="text-xs text-muted-foreground">{pendingProposal.note}</p>
              )}
            </div>
            {canDecideProposal ? (
              <RateProposalDecisionButtons collaborationId={collaboration.id} proposalId={pendingProposal.id} />
            ) : (
              <span className="text-xs text-muted-foreground">En attente de l&apos;autre partie</span>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique des taux</CardTitle>
        </CardHeader>
        <CardContent>
          {rateHistory.length === 0 ? (
            <EmptyState message="Aucun historique de taux." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ancien taux</TableHead>
                  <TableHead>Nouveau taux</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="tabular-nums">{entry.old_rate ?? "—"}</TableCell>
                    <TableCell className="tabular-nums">{entry.new_rate}</TableCell>
                    <TableCell>
                      <StatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {collaboration.status === "accepted" && (
        <Card>
          <CardHeader>
            <CardTitle>Taux d&apos;envoi privé applicable</CardTitle>
            <p className="text-sm text-muted-foreground">
              {`Réglé par devise SOURCE depuis la page Taux d'envoi. Un envoi déjà en ${collaboration.currency} n'en a pas besoin — seuls les envois dans une autre devise (ex. via une entrée dans une devise différente) exigent un taux pour cette devise.`}
            </p>
            <CardAction>
              <Button asChild size="sm" variant="outline">
                <Link href="/private-rates">
                  Gérer les taux d&apos;envoi
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {applicableRates.length === 0 ? (
              <EmptyState message="Aucun taux d'envoi actif pour cette collaboration. Un envoi sera bloqué tant qu'un taux n'est pas défini pour la paire de devises voulue." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paire</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Type d&apos;opération</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicableRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        {rate.currency} → {rate.target_currency ?? "toutes devises"}
                      </TableCell>
                      <TableCell>{rate.country ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rate.operation_type ? sendModeLabels[rate.operation_type] : "Tous"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{rate.rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
