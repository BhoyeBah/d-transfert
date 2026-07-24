"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UpdateEntityDialog({
  trigger,
  title,
  description,
  action,
  successMessage,
  children,
  submitLabel = "Enregistrer",
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  successMessage: string;
  children: (state: ActionState) => ReactNode;
  submitLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(initialActionState);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.status === "success") {
        toast.success(successMessage);
        setOpen(false);
        formRef.current?.reset();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setState(initialActionState);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          {children(state)}
          {state.status === "error" && state.message && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
