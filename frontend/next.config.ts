import type { NextConfig } from "next";

// Reflète le même interrupteur que useSecureCookies (frontend/src/lib/session.ts) : tant
// que le déploiement n'est pas encore derrière HTTPS, forcer HSTS casserait l'accès en
// HTTP pur (le navigateur mémorise l'en-tête et refuse ensuite tout retour en HTTP).
const useSecureHeaders = process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "true";

// 'unsafe-inline' sur script/style reste nécessaire ici : Next.js injecte des scripts inline
// pour l'hydratation et Radix UI (shadcn/ui) pose des styles inline pour le positionnement des
// popovers/dialogs — un CSP strict à base de nonce forcerait tout le site en rendu dynamique
// (cf. node_modules/next/dist/docs .../content-security-policy.md). Même avec 'unsafe-inline',
// ce CSP apporte une vraie protection en défense en profondeur : aucun script/style/frame
// externe non listé ne peut être chargé, même via une injection XSS.
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

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
          { key: "Content-Security-Policy", value: cspHeader },
          ...(useSecureHeaders
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
