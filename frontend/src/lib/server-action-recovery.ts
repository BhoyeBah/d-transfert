// Chaque déploiement fait tourner les identifiants de Server Action (voir la doc Next.js,
// "Deployment considerations"). Si cette page est restée ouverte pendant un déploiement,
// l'action appelée n'existe plus côté serveur et l'appel rejette avec cette erreur — sans
// traitement, elle reste non interceptée et casse la page. Un rechargement complet récupère
// le dernier bundle et résout le problème à coup sûr.
export function isStaleServerActionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "UnrecognizedActionError" || /was not found on the server/i.test(error.message))
  );
}

export function recoverFromStaleServerAction() {
  window.location.reload();
}
