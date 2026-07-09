import { z } from "zod";

export const WALLET_TYPES = ["cash", "mobile_money", "bank", "other"] as const;

export const walletTypeLabels: Record<(typeof WALLET_TYPES)[number], string> = {
  cash: "Espèces",
  mobile_money: "Mobile money",
  bank: "Banque",
  other: "Autre",
};

export const createWalletSchema = z.object({
  name: z.string().min(2, "2 caractères minimum.").max(128),
  code: z.string().min(2, "2 caractères minimum.").max(32),
  type: z.enum(WALLET_TYPES, { message: "Type de wallet invalide." }),
  phone: z.string().max(32).optional().or(z.literal("")),
  currency: z.string("Devise requise.").min(3, "Devise invalide.").max(8, "Devise invalide."),
  initial_balance: z.coerce.number("Montant invalide.").min(0, "Doit être positif ou nul.").default(0),
  description: z.string().max(255).optional().or(z.literal("")),
});
