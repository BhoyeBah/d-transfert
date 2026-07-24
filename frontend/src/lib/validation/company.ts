import { z } from "zod";

import { currencySchema, DEFAULT_SUPPORTED_CURRENCIES } from "@/lib/validation/auth";

export function createUpdateCompanySchema(supportedCurrencies: readonly string[]) {
  return z.object({
    name: z.string().min(2, "2 caractères minimum.").max(255),
    address: z.string().min(2, "Adresse requise.").max(255),
    phone: z.string().min(6, "Numéro de téléphone invalide.").max(32),
    default_currency: currencySchema(supportedCurrencies),
  });
}

export const updateCompanySchema = createUpdateCompanySchema(DEFAULT_SUPPORTED_CURRENCIES);

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;
