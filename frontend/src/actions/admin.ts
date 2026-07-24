"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import type { ActionState } from "@/lib/action-state";
import type { MutationResult } from "@/lib/mutation-result";
import { createPlatformAdminSchema, updatePlatformAdminSchema } from "@/lib/validation/admin";
import { createRegisterSchema } from "@/lib/validation/auth";
import type {
  AdminBackupAction,
  CompanyStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/api";

type RegisterResponse = {
  company_id: string;
  registration_code: string;
  owner_user_id: string;
};

export async function setAdminCompanyStatusAction(
  companyId: string,
  status: CompanyStatus
): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/admin/companies/${companyId}/status`, {
      method: "PATCH",
      body: { status },
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);
  return { ok: true, data: undefined };
}

export async function updateAdminCompanyAction(
  companyId: string,
  payload: {
    name: string;
    address: string | null;
    phone: string;
    default_currency: string;
  }
): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/admin/companies/${companyId}`, {
      method: "PATCH",
      body: payload,
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);
  return { ok: true, data: undefined };
}

export async function createAdminCompanyAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supported_currencies } = await getPublicPlatformSettings();
  const parsed = createRegisterSchema(supported_currencies).safeParse({
    company_name: formData.get("company_name"),
    company_phone: formData.get("company_phone"),
    address: formData.get("address"),
    default_currency: formData.get("default_currency"),
    owner_full_name: formData.get("owner_full_name"),
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const created = await serverFetch<RegisterResponse>("/api/v1/admin/companies", {
      method: "POST",
      body: parsed.data,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    return { status: "success", data: created };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Impossible de contacter le serveur." };
  }
}

export async function setAdminUserStatusAction(
  userId: string,
  companyId: string | null,
  isActive: boolean
): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/admin/users/${userId}/status`, {
      method: "PATCH",
      body: { is_active: isActive },
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  if (companyId) {
    revalidatePath(`/admin/companies/${companyId}`);
  } else {
    revalidatePath("/admin/platform-admins");
  }
  return { ok: true, data: undefined };
}

export async function createPlatformAdminAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = createPlatformAdminSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await serverFetch("/api/v1/admin/platform-admins", {
      method: "POST",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Impossible de contacter le serveur." };
  }

  revalidatePath("/admin/platform-admins");
  return { status: "success" };
}

export async function updatePlatformAdminAction(
  adminId: string,
  payload: { full_name?: string; phone?: string; password?: string }
): Promise<MutationResult> {
  const parsed = updatePlatformAdminSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await serverFetch(`/api/v1/admin/platform-admins/${adminId}`, {
      method: "PATCH",
      body: parsed.data,
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/admin/platform-admins");
  return { ok: true, data: undefined };
}

export async function deletePlatformAdminAction(adminId: string): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/admin/platform-admins/${adminId}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/admin/platform-admins");
  return { ok: true, data: undefined };
}

export async function updateAdminSettingsAction(payload: {
  supported_currencies: string[];
  max_transaction_amount: number | null;
  maintenance_mode: boolean;
  require_company_approval: boolean;
}): Promise<MutationResult> {
  try {
    await serverFetch("/api/v1/admin/settings", {
      method: "PATCH",
      body: {
        supported_currencies: payload.supported_currencies,
        max_transaction_amount:
          payload.max_transaction_amount !== null ? String(payload.max_transaction_amount) : null,
        maintenance_mode: payload.maintenance_mode,
        require_company_approval: payload.require_company_approval,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/admin/settings");
  return { ok: true, data: undefined };
}

export async function createAdminBackupAction(): Promise<MutationResult<AdminBackupAction>> {
  try {
    const result = await serverFetch<AdminBackupAction>("/api/v1/admin/backups", {
      method: "POST",
    });
    revalidatePath("/admin/settings");
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
}

export async function restoreAdminBackupAction(
  filename: string
): Promise<MutationResult<AdminBackupAction>> {
  try {
    const result = await serverFetch<AdminBackupAction>("/api/v1/admin/backups/restore", {
      method: "POST",
      body: { filename },
    });
    revalidatePath("/admin/settings");
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
}

export async function updateAdminSubscriptionAction(
  companyId: string,
  payload: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    price: number | null;
    currency: string | null;
  }
): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/admin/companies/${companyId}/subscription`, {
      method: "PATCH",
      body: {
        plan: payload.plan,
        status: payload.status,
        price: payload.price !== null ? String(payload.price) : null,
        currency: payload.currency || null,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath(`/admin/companies/${companyId}`);
  return { ok: true, data: undefined };
}

export async function deleteAdminCompanyAction(companyId: string): Promise<MutationResult> {
  try {
    await serverFetch(`/api/v1/admin/companies/${companyId}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  return { ok: true, data: undefined };
}
