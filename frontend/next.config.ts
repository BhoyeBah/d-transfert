import type { NextConfig } from "next";

// Reflète le même interrupteur que useSecureCookies (frontend/src/lib/session.ts) : tant
// que le déploiement n'est pas encore derrière HTTPS, forcer HSTS casserait l'accès en
// HTTP pur (le navigateur mémorise l'en-tête et refuse ensuite tout retour en HTTP).
const useSecureHeaders = process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "true";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Les preuves de paiement (photo/scan de reçu) sont envoyées comme argument direct de
    // Server Actions (approveTransferAction, uploadTransferProofAction,
    // uploadPaymentProofAction), pas via un Route Handler — leur taille est donc bornée par
    // cette limite plutôt que par max_upload_size_mb côté backend (10 Mo). Sans ça, Next.js
    // bloque tout au-delà de 1 Mo par défaut avant même d'atteindre le backend.
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(useSecureHeaders
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
