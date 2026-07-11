"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import type { ActionState } from "@/lib/action-state";
import { createPrivateRateSchema } from "@/lib/validation/private-rates";

export async function createPrivateRateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = createPrivateRateSchema.safeParse({
    collaboration_id: formData.get("collaboration_id") || undefined,
    country: formData.get("country") || undefined,
    operation_type: formData.get("operation_type") || undefined,
    currency: formData.get("currency"),
    rate: formData.get("rate"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await serverFetch("/api/v1/private-rates", {
      method: "POST",
      body: {
        collaboration_id: parsed.data.collaboration_id || null,
        country: parsed.data.country || null,
        operation_type: parsed.data.operation_type || null,
        currency: parsed.data.currency,
        rate: String(parsed.data.rate),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Impossible de contacter le serveur." };
  }

  revalidatePath("/private-rates");
  revalidatePath("/collaborations");
  return { status: "success" };
}
