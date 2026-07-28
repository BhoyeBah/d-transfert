import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string; proofId: string }> }
) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { paymentId, proofId } = await params;
  // Ces segments doivent être des UUID (seule forme attendue par la route backend) : bloque
  // toute tentative de faire sortir l'URL cible du préfixe attendu via un segment malformé,
  // même si le RBAC backend reste de toute façon la source de vérité (cf. reports/[...path]).
  if (!UUID_RE.test(paymentId) || !UUID_RE.test(proofId)) {
    return new NextResponse(null, { status: 400 });
  }
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/${paymentId}/proofs/${proofId}/file`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": response.headers.get("content-disposition") ?? "inline",
    },
  });
}
