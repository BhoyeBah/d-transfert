import { z } from "zod";

export const createPlatformAdminSchema = z.object({
  full_name: z.string().min(2, "2 caractères minimum.").max(255),
  phone: z.string().min(6, "Téléphone requis.").max(32),
  password: z.string().min(8, "8 caractères minimum."),
});

export const updatePlatformAdminSchema = z.object({
  full_name: z.string().min(2, "2 caractères minimum.").max(255).optional(),
  phone: z.string().min(6, "Téléphone requis.").max(32).optional(),
  password: z.string().min(8, "8 caractères minimum.").optional(),
});
