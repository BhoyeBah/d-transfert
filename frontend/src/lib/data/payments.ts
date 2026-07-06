import "server-only";

import { serverFetch } from "@/lib/api";
import type { Payment, PaymentStatusHistoryEntry, Proof } from "@/types/api";

export async function listPayments(): Promise<Payment[]> {
  return serverFetch<Payment[]>("/api/v1/payments");
}

export async function getPayment(paymentId: string): Promise<Payment> {
  return serverFetch<Payment>(`/api/v1/payments/${paymentId}`);
}

export async function getPaymentStatusHistory(paymentId: string): Promise<PaymentStatusHistoryEntry[]> {
  return serverFetch<PaymentStatusHistoryEntry[]>(`/api/v1/payments/${paymentId}/status-history`);
}

export async function listPaymentProofs(paymentId: string): Promise<Proof[]> {
  return serverFetch<Proof[]>(`/api/v1/payments/${paymentId}/proofs`);
}
