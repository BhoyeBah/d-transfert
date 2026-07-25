import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { path } = await params;
  // Chaque segment doit être un mot simple ou un UUID (les seules formes que prennent les
  // routes /api/v1/reports/*) : bloque toute tentative de faire sortir l'URL cible du préfixe
  // /api/v1/reports/ via des segments type "..". Le RBAC backend reste de toute façon la
  // source de vérité, mais autant ne pas transmettre des segments non attendus.
  if (path.some((segment) => !/^[a-zA-Z0-9_-]+$/.test(segment))) {
    return new NextResponse(null, { status: 400 });
  }
  const query = request.nextUrl.search;

  const response = await fetch(`${API_BASE_URL}/api/v1/reports/${path.join("/")}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": response.headers.get("content-disposition") ?? "attachment; filename=rapport.csv",
    },
  });
}
