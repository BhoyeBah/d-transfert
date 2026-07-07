import { z } from "zod";

import { RELIQUAT_ACTIONS } from "@/lib/validation/transfers";

export const createPaymentSchema = z
  .object({
    collaboration_id: z.string().min(1, "Collaboration requise."),
    entry_id: z.string().optional(),
    wallet_id: z.string().optional(),
    amount: z.number().gt(0, "Montant requis."),
    currency: z.string().min(3).max(8),
    client_name: z.string().max(255).optional(),
    client_phone: z.string().max(32).optional(),
    note: z.string().max(255).optional(),
    reliquat_action: z.enum(RELIQUAT_ACTIONS).optional(),
  })
  .refine((data) => !(data.entry_id && data.wallet_id), {
    message: "Choisissez une entrée OU un wallet, pas les deux.",
    path: ["wallet_id"],
  });

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;
