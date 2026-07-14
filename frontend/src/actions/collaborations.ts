"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import type { ActionState } from "@/lib/action-state";
import type { MutationResult } from "@/lib/mutation-result";
import {
  proposeRateSchema,
  requestCollaborationSchema,
  updateCollaborationSchema,
} from "@/lib/validation/collaborations";
import type { Collaboration, CollaborationRateHistoryEntry } from "@/types/api";

export async function requestCollaborationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = requestCollaborationSchema.safeParse({
    target_matricule: formData.get("target_matricule"),
    currency: formData.get("currency"),
    initial_rate: formData.get("initial_rate"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await serverFetch("/api/v1/collaborations", {
      method: "POST",
      body: {
        target_matricule: parsed.data.target_matricule,
        currency: parsed.data.currency,
        initial_rate: String(parsed.data.initial_rate),
        note: parsed.data.note || null,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Impossible de contacter le serveur." };
  }

  revalidatePath("/collaborations");
  return { status: "success" };
}

export async function acceptCollaborationAction(collaborationId: string): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/collaborations/${collaborationId}/accept`, { method: "POST" });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/collaborations");
  revalidatePath(`/collaborations/${collaborationId}`);
  return { ok: true, data: undefined };
}

export async function rejectCollaborationAction(
  collaborationId: string,
  reason?: string
): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/collaborations/${collaborationId}/reject`, {
      method: "POST",
      body: { reason: reason || null },
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/collaborations");
  revalidatePath(`/collaborations/${collaborationId}`);
  return { ok: true, data: undefined };
}

export async function cancelCollaborationAction(collaborationId: string): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/collaborations/${collaborationId}/cancel`, { method: "POST" });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/collaborations");
  revalidatePath(`/collaborations/${collaborationId}`);
  return { ok: true, data: undefined };
}

export async function updateCollaborationAction(
  collaborationId: string,
  payload: { currency?: string; initial_rate?: number; note?: string }
): Promise<MutationResult<Collaboration>> {
  const parsed = updateCollaborationSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  try {
    const collaboration = await serverFetch<Collaboration>(`/api/v1/collaborations/${collaborationId}`, {
      method: "PATCH",
      body: {
        ...(parsed.data.currency !== undefined ? { currency: parsed.data.currency } : {}),
        ...(parsed.data.initial_rate !== undefined ? { initial_rate: String(parsed.data.initial_rate) } : {}),
        ...(parsed.data.note !== undefined ? { note: parsed.data.note || null } : {}),
      },
    });
    revalidatePath("/collaborations");
    revalidatePath(`/collaborations/${collaborationId}`);
    return { ok: true, data: collaboration };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
}

export async function proposeRateAction(
  collaborationId: string,
  payload: { new_rate: number; note?: string }
): Promise<MutationResult<CollaborationRateHistoryEntry>> {
  const parsed = proposeRateSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  try {
    const proposal = await serverFetch<CollaborationRateHistoryEntry>(
      `/api/v1/collaborations/${collaborationId}/rate-proposals`,
      { method: "POST", body: { new_rate: String(parsed.data.new_rate), note: parsed.data.note || null } }
    );
    revalidatePath(`/collaborations/${collaborationId}`);
    return { ok: true, data: proposal };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
}

export async function decideRateProposalAction(
  collaborationId: string,
  proposalId: string,
  decision: "accept" | "reject",
  reason?: string
): Promise<MutationResult> {
  try {
    await serverFetch(
      `/api/v1/collaborations/${collaborationId}/rate-proposals/${proposalId}/${decision}`,
      { method: "POST", body: decision === "reject" ? { reason: reason || null } : undefined }
    );
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath(`/collaborations/${collaborationId}`);
  return { ok: true, data: undefined };
}
