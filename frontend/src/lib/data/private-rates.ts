import "server-only";

import { serverFetch } from "@/lib/api";
import type { PrivateRate } from "@/types/api";

export async function listPrivateRates(): Promise<PrivateRate[]> {
  return serverFetch<PrivateRate[]>("/api/v1/private-rates");
}
