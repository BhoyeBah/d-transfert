import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

// Le flux reste ouvert indéfiniment (heartbeat côté backend) : sans ceci, Next.js essaierait
// de mettre la réponse en cache comme une route statique classique.
export const dynamic = "force-dynamic";

/**
 * Relaie le flux SSE du backend vers le navigateur. Nécessaire car le token d'accès vit dans
 * un cookie httpOnly (illisible en JS) : EventSource ne peut pas poser d'en-tête Authorization
 * lui-même, ce proxy le fait à sa place côté serveur. Le corps de la réponse amont
 * (`upstream.body`) est transmis tel quel — pas de bufferisation — pour un vrai streaming.
 */
export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/notifications/stream`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: request.signal,
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
