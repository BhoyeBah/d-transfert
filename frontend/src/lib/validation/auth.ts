import { z } from "zod";

export const DEFAULT_SUPPORTED_CURRENCIES = ["XOF", "GNF", "USD", "EUR"] as const;

export function currencySchema(supportedCurrencies: readonly string[]) {
  const normalized = supportedCurrencies.map((currency) => currency.toUpperCase());
  return z
    .string()
    .min(3, "Devise invalide.")
    .max(8, "Devise invalide.")
    .transform((value) => value.toUpperCase())
    .refine((value) => normalized.includes(value), {
      message: "Choisissez une devise.",
    });
}

export function createRegisterSchema(supportedCurrencies: readonly string[]) {
  return z
    .object({
      company_name: z.string().min(2, "2 caractères minimum.").max(255),
      company_phone: z.string().min(6, "Numéro de téléphone invalide.").max(32),
      address: z.string().min(2, "Adresse requise.").max(255),
      default_currency: currencySchema(supportedCurrencies),
      owner_full_name: z.string().min(2, "2 caractères minimum.").max(255),
      password: z.string().min(8, "8 caractères minimum."),
      password_confirmation: z.string().min(8, "8 caractères minimum."),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["password_confirmation"],
    });
}

export const registerSchema = createRegisterSchema(DEFAULT_SUPPORTED_CURRENCIES);

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  matricule: z.string().min(1, "Matricule requis."),
  password: z.string().min(1, "Mot de passe requis."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  matricule: z.string().min(1, "Matricule requis."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    matricule: z.string().min(1, "Matricule requis."),
    otp_code: z.string().min(4, "Code invalide.").max(12),
    new_password: z.string().min(8, "8 caractères minimum."),
    new_password_confirmation: z.string().min(8, "8 caractères minimum."),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["new_password_confirmation"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
