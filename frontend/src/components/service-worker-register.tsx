"use client";

import { useEffect } from "react";

// N'enregistre le service worker qu'en production : en développement, un service worker
// actif complique le rechargement à chaud et peut servir des bundles obsolètes.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Échec silencieux : l'app reste pleinement fonctionnelle sans service worker,
      // seule l'installabilité PWA sur certains navigateurs peut en dépendre.
    });
  }, []);

  return null;
}
