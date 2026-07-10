import { z } from "zod";

import { SUPPORTED_CURRENCIES } from "@/lib/validation/auth";

export const updateCompanySchema = z.object({
  name: z.string().min(2, "2 caractères minimum.").max(255),
  address: z.string().min(2, "Adresse requise.").max(255),
  phone: z.string().min(6, "Numéro de téléphone invalide.").max(32),
  default_currency: z.enum(SUPPORTED_CURRENCIES, {
    message: "Choisissez une devise.",
  }),
});

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;
