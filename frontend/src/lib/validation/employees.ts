import { z } from "zod";

import { PermissionCode } from "@/lib/permissions";

const permissionCodeValues = Object.values(PermissionCode) as [string, ...string[]];

const optionalEmail = z.union([z.string().email("Adresse email invalide."), z.literal("")]).optional();

export const createEmployeeSchema = z.object({
  full_name: z.string().min(2, "2 caractères minimum.").max(255),
  phone: z.string().min(6, "Numéro invalide.").max(32),
  email: optionalEmail,
  password: z.string().min(8, "8 caractères minimum."),
  permissions: z.array(z.enum(permissionCodeValues, { message: "Permission invalide." })).default([]),
});

export const updateEmployeeSchema = z.object({
  full_name: z.string().min(2, "2 caractères minimum.").max(255).optional(),
  phone: z.string().min(6, "Numéro invalide.").max(32).optional(),
  email: optionalEmail,
  password: z.string().min(8, "8 caractères minimum.").optional(),
});
