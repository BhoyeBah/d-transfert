"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import type { ActionState } from "@/lib/action-state";
import { createUpdateCompanySchema } from "@/lib/validation/company";
import type { CompanyMe } from "@/types/api";

export async function updateCompanyAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supported_currencies } = await getPublicPlatformSettings();
  const parsed = createUpdateCompanySchema(supported_currencies).safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    default_currency: formData.get("default_currency"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await serverFetch<CompanyMe>("/api/v1/companies/me", {
      method: "PATCH",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Impossible de contacter le serveur." };
  }

  revalidatePath("/company");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/collaborations");
  revalidatePath("/suppliers");
  return { status: "success" };
}
