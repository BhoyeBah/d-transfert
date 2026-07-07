"use client";

import { useRef, useState, useTransition } from "react";
import { DownloadIcon, PaperclipIcon } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/lib/format";
import type { MutationResult } from "@/lib/mutation-result";
import type { Proof } from "@/types/api";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function ProofsCard({
  proofs,
  fileHrefBase,
  uploadAction,
}: {
  proofs: Proof[];
  fileHrefBase: string;
  uploadAction: (formData: FormData) => Promise<MutationResult<Proof>>;
}) {
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState(proofs);
  const formRef = useRef<HTMLFormElement>(null);

  function upload(formData: FormData) {
    startTransition(async () => {
      const result = await uploadAction(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Preuve ajoutée.");
      setList((current) => [...current, result.data]);
      formRef.current?.reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preuves</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form ref={formRef} action={upload} className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="proof-file">Ajouter une preuve</Label>
            <Input
              id="proof-file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              required
              className="max-w-xs"
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            <PaperclipIcon />
            Ajouter
          </Button>
        </form>

        {list.length === 0 ? (
          <EmptyState message="Aucune preuve jointe pour le moment." />
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((proof) => (
              <li
                key={proof.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 font-medium">
                    {proof.file_name}
                    <StatusBadge status={proof.status} />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(proof.file_size)} · {formatDate(proof.created_at)}
                    {proof.note ? ` · ${proof.note}` : ""}
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`${fileHrefBase}/${proof.id}/file`} target="_blank" rel="noreferrer">
                    <DownloadIcon />
                    Ouvrir
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
