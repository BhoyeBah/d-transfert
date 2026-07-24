// Service worker volontairement minimal : ne met rien en cache. Les données affichées
// (soldes, envois, taux...) sont sensibles et changent en permanence — les mettre en cache
// risquerait de montrer des chiffres obsolètes. Son seul rôle est de satisfaire le critère
// d'installabilité PWA (présence d'un gestionnaire fetch) sur certains navigateurs Android.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pas de event.respondWith() : le navigateur traite la requête normalement, sans cache.
});
