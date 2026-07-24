import type { Metadata } from "next";

import { getPublicPlatformSettings } from "@/lib/data/platform-settings";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Inscription — D-Transfert" };

export default async function RegisterPage() {
  const { supported_currencies } = await getPublicPlatformSettings();

  return <RegisterForm supportedCurrencies={supported_currencies} />;
}
