import { z } from "zod";

import { SEND_MODES } from "@/lib/validation/transfers";

export const requestCollaborationSchema = z.object({
  target_matricule: z.string().min(1, "Matricule requis."),
  currency: z.string("Devise requise.").min(3, "Devise invalide.").max(8, "Devise invalide."),
  initial_rate: z.coerce.number("Taux invalide.").gt(0, "Le taux doit être positif."),
  note: z.string().max(255).optional(),
});

export const proposeRateSchema = z.object({
  new_rate: z.coerce.number("Taux invalide.").gt(0, "Le taux doit être positif."),
  note: z.string().max(255).optional(),
});

export const createPrivateRateSchema = z.object({
  collaboration_id: z.string().optional(),
  country: z.string().max(64).optional(),
  operation_type: z.enum(SEND_MODES, { message: "Type d'opération invalide." }).optional(),
  currency: z.string("Devise requise.").min(3, "Devise invalide.").max(8, "Devise invalide."),
  rate: z.coerce.number("Taux invalide.").gt(0, "Le taux doit être positif."),
});
