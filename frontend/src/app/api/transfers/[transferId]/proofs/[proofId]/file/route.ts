import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ transferId: string; proofId: string }> }
) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { transferId, proofId } = await params;
  const response = await fetch(`${API_BASE_URL}/api/v1/transfers/${transferId}/proofs/${proofId}/file`, {
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
