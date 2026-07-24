"use client";

import { useState, useTransition } from "react";
import { DownloadIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createAdminBackupAction, restoreAdminBackupAction } from "@/actions/admin";
import type { AdminBackup } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function RestoreBackupButton({
  backup,
  maintenanceMode,
}: {
  backup: AdminBackup;
  maintenanceMode: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreAdminBackupAction(backup.filename);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.data.detail);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!maintenanceMode || isPending}>
          <RefreshCwIcon className="size-4" />
          Restaurer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restaurer cette sauvegarde ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action remplace les données actuelles par le contenu de{" "}
            <span className="font-mono font-medium">{backup.filename}</span>. Assure-toi que le
            mode maintenance est activé et que personne n&apos;utilise encore l&apos;application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Restauration…" : "Oui, restaurer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BackupManagementCard({
  backups,
  maintenanceMode,
}: {
  backups: AdminBackup[];
  maintenanceMode: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createAdminBackupAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.data.detail);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Sauvegardes base de données</CardTitle>
            <CardDescription>
              Les backups sont stockés sur le serveur. La restauration exige le mode maintenance.
            </CardDescription>
          </div>
          <Button onClick={handleCreate} disabled={isPending}>
            <DownloadIcon className="size-4" />
            {isPending ? "Création..." : "Créer une sauvegarde"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!maintenanceMode && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <p>
              Le mode maintenance est désactivé. Active-le avant toute restauration pour éviter
              de modifier la base pendant que l&apos;application est utilisée.
            </p>
          </div>
        )}

        {backups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune sauvegarde disponible pour le moment.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Fichier</th>
                  <th className="px-4 py-3 font-medium">Créée le</th>
                  <th className="px-4 py-3 font-medium">Taille</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.filename} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{backup.filename}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(backup.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBytes(backup.size_bytes)}</td>
                    <td className="px-4 py-3">
                      <RestoreBackupButton backup={backup} maintenanceMode={maintenanceMode} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
