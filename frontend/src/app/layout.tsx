import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { ThemeInitializer } from "@/components/theme-initializer";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D-Transfert",
  description:
    "Gestion multi-entreprises des wallets, opérations nationales, collaborations et envois internationaux.",
  applicationName: "D-Transfert",
  // Installation sur l'écran d'accueil iOS : sans ces balises, Safari ouvre l'app dans un
  // onglet Safari classique au lieu du mode standalone même après "Sur l'écran d'accueil".
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "D-Transfert",
  },
  // Évite que Safari transforme automatiquement les séquences de chiffres (montants,
  // matricules) en liens d'appel téléphonique.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // "cover" étend le contenu sous l'encoche/la barre d'accueil iPhone — nécessaire en mode
  // standalone (cf. paddings env(safe-area-inset-*) dans globals.css) sinon une bande noire
  // apparaît en haut/bas de l'écran.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1316" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${ibmPlexMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ThemeInitializer />
        <ServiceWorkerRegister />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
