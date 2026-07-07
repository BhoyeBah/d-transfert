import { z } from "zod";

export const SUPPLIER_MOVEMENT_TYPES = ["debt", "payment"] as const;

export const supplierMovementTypeLabels: Record<(typeof SUPPLIER_MOVEMENT_TYPES)[number], string> = {
  debt: "Le fournisseur recharge le wallet (dette envers lui)",
  payment: "Vous remboursez le fournisseur (sortie du wallet)",
};

export const supplierMovementTypeHints: Record<(typeof SUPPLIER_MOVEMENT_TYPES)[number], string> = {
  debt:
    "Le fournisseur vous a remis du cash ou du mobile money sans que vous le régliez immédiatement : " +
    "le wallet choisi augmente du montant, et vous devez désormais ce montant en plus au fournisseur.",
  payment:
    "Vous réglez le fournisseur (en espèces ou mobile money) depuis un de vos wallets : le wallet " +
    "choisi diminue du montant, et votre dette envers le fournisseur se réduit d'autant.",
};

export const createSupplierSchema = z.object({
  name: z.string().min(2, "2 caractères minimum.").max(255),
  code: z.string().min(2, "2 caractères minimum.").max(32),
  phone: z.string().max(32).optional(),
  address: z.string().max(255).optional(),
  currency: z.string().min(3).max(8),
  initial_balance: z.coerce.number().default(0),
  note: z.string().max(255).optional(),
});

export const rebalanceSupplierSchema = z.object({
  type: z.enum(SUPPLIER_MOVEMENT_TYPES),
  amount: z.number().gt(0, "Montant requis."),
  wallet_id: z.string().min(1, "Wallet requis."),
  note: z.string().max(255).optional(),
});

export type RebalanceSupplierFormValues = z.infer<typeof rebalanceSupplierSchema>;
