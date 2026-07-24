import "server-only";

import { serverFetch } from "@/lib/api";

export type PublicPlatformSettings = {
  supported_currencies: string[];
};

export async function getPublicPlatformSettings(): Promise<PublicPlatformSettings> {
  return serverFetch<PublicPlatformSettings>("/api/v1/auth/platform-settings", { skipAuth: true });
}
