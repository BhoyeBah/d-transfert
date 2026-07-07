import { z } from "zod";

export const SEND_MODES = ["cash", "wave", "orange_money", "bank", "other"] as const;

export const sendModeLabels: Record<(typeof SEND_MODES)[number], string> = {
  cash: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  bank: "Virement bancaire",
  other: "Autre",
};

export const RELIQUAT_ACTIONS = ["unallocated", "fee", "client_credit"] as const;

export const reliquatActionLabels: Record<(typeof RELIQUAT_ACTIONS)[number], string> = {
  unallocated: "Laisser disponible sur l'entrée",
  fee: "Conserver comme frais",
  client_credit: "Créditer le solde du client",
};

export const createTransferSchema = z.object({
  collaboration_id: z.string().min(1, "Collaboration requise."),
  entry_id: z.string().optional(),
  amount: z.number().gt(0, "Montant requis."),
  currency: z.string().min(3).max(8),
  beneficiary_name: z.string().max(255).optional(),
  beneficiary_phone: z.string().min(1, "Téléphone du bénéficiaire requis."),
  send_mode: z.enum(SEND_MODES),
  note: z.string().max(255).optional(),
  client_name: z.string().max(255).optional(),
  client_phone: z.string().max(32).optional(),
  reliquat_action: z.enum(RELIQUAT_ACTIONS).optional(),
});

export type CreateTransferFormValues = z.infer<typeof createTransferSchema>;
