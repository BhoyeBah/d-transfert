import { z } from "zod";

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

export const updateCollaborationSchema = z.object({
  currency: z.string().min(3, "Devise invalide.").max(8, "Devise invalide.").optional(),
  initial_rate: z.coerce.number("Taux invalide.").gt(0, "Le taux doit être positif.").optional(),
  note: z.string().max(255).optional(),
});
