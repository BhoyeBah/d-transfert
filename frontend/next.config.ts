import type { NextConfig } from "next";

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
};

export default nextConfig;
