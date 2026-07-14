# Diagnostic de préparation à la production — D-Transfert

Date : 2026-07-13
Basé sur : lecture complète du cahier des charges (`TODO.md`, 41 sections), lecture du
code backend (FastAPI) et frontend (Next.js 16), exécution réelle de la suite de tests
(212 tests), du build de production frontend, du typecheck et du lint.

**Verdict global : le projet est fonctionnellement conforme au MVP du cahier des
charges et fonctionne correctement (212/212 tests backend passent, build frontend
propre), mais il n'est PAS prêt à être exposé en production tel quel.** Les manques
ne sont pas dans la logique métier (solide et bien testée) mais dans le
**durcissement opérationnel** : secrets, déploiement, sauvegarde, observabilité. Tous
sont réalistes à corriger en 1 à 3 jours de travail, sans réécriture.

---

## 1. Conformité fonctionnelle vs cahier des charges

Le fichier `IMPLEMENTATION_STATUS.md` (déjà tenu à jour au fil du projet) recense un
module par module. Résumé :

| Statut | Modules |
|---|---|
| **Conforme** | Authentification, entreprises, employés, rôles/permissions, wallets, opérations nationales (mono et multi-devises), entrées, envois internationaux, paiements collaborateurs, collaborations, taux privés, taux collaboratifs, clients/dettes, fournisseurs, preuves, dashboard (Owner + Employé), rapports (JSON + CSV), audit logs, administration plateforme, frontend web MVP |
| **Partiel (assumé)** | Notifications — internes seulement ; email/SMS/WhatsApp explicitement "hors MVP" par le cahier des charges lui-même (§37.2) |
| **Écart assumé** | Export PDF/Excel natif des rapports (CSV seulement, ouvrable dans Excel) ; application mobile native (PWA recommandée à la place, non empaquetée) |

Ces trois écarts sont **explicitement listés comme hors-MVP par le cahier des charges
lui-même** (§37.2) — ce ne sont pas des bugs, mais des reports assumés.

### Points ouverts issus des échanges précédents (à vérifier avant mise en prod)

- **Sélecteur de devise à l'inscription** : un utilisateur a signalé un menu qui ne
  s'ouvrait pas sur `/register`. Non reproduit en test (Playwright confirme un
  fonctionnement correct côté code) — probablement un souci d'environnement/navigateur
  côté utilisateur, mais à reconfirmer avec lui avant de le classer sans suite.
- **Affichage des paires de devises sur les taux** (ex. `FCFA → GNF`) : proposition
  faite en cours de route, jamais tranchée ni implémentée. Amélioration UX facultative.

---

## 2. Sécurité

| Point | État | Détail |
|---|---|---|
| Hash des mots de passe | ✅ Bon | Argon2 (`passlib`), algorithme moderne recommandé. |
| JWT | ⚠️ À corriger avant prod | HS256, `access_token` 30 min, `refresh_token` 14 jours. **Aucune vérification au démarrage que `JWT_SECRET_KEY` a été changé en production** — si `ENVIRONMENT=production` tourne encore avec la valeur par défaut du dépôt (`dev-only-change-me...`), n'importe qui peut forger un token valide. Le README documente qu'il faut le changer, mais rien ne l'impose techniquement. |
| Révocation de session | ⚠️ Manquant | Les tokens ont un `jti` mais aucune liste de révocation n'est vérifiée : un refresh token volé reste utilisable jusqu'à 14 jours même après un changement de mot de passe ou une "déconnexion". |
| Verrouillage brute-force | ✅ Bon | 5 échecs → verrouillage 15 min, par compte. |
| Rate limiting HTTP global | ❌ Absent | Aucun middleware de rate limiting (pas de `slowapi`, pas de reverse-proxy documenté qui le ferait). Un attaquant peut distribuer les tentatives sur plusieurs matricules sans être freiné au niveau HTTP. |
| CORS | ➖ Non configuré, mais probablement non nécessaire | Le frontend appelle le backend uniquement côté serveur (pattern BFF, cookies httpOnly) — le navigateur ne parle jamais directement à FastAPI. À confirmer qu'aucun appel client-side direct n'existe avant de considérer ça comme un non-problème définitif. |
| Cookies de session | ✅ Bon | `httpOnly: true`, `secure` activé en production, `sameSite: lax`. |
| Fuite d'erreurs | ✅ Bon | Les exceptions non gérées sont loggées en base (`system_logs`) et renvoient un message générique au client, jamais de stack trace. |
| Isolation multi-entreprise | ✅ Bon | Toutes les requêtes scopent par `company_id` dérivé du token ; testé (401/403/404 selon les cas). |
| En-têtes de sécurité HTTP (HSTS, X-Frame-Options, CSP...) | ❌ Absent | Aucun middleware ni configuration ; à ajouter au niveau du reverse-proxy (nginx/Caddy) ou via middleware Next.js/FastAPI avant l'exposition publique. |

**Bloquant avant mise en ligne réelle** : générer un `JWT_SECRET_KEY` fort et unique en
production, et idéalement ajouter une vérification qui refuse de démarrer si
`ENVIRONMENT=production` et que la clé vaut encore la valeur par défaut du dépôt.

---

## 3. Infrastructure & déploiement

| Point | État | Détail |
|---|---|---|
| Dockerfile backend | ✅ Correct | Migration automatique au démarrage (`alembic upgrade head && uvicorn ...`), `PORT` configurable. |
| Dockerfile frontend | ✅ Correct | Build multi-stage, sortie `standalone`, `NEXT_TELEMETRY_DISABLED`. |
| `docker-compose.yml` | ⚠️ Dev seulement | Ne contient que Postgres (avec identifiants en clair `dtransfert/dtransfert`). Pas de service backend, pas de service frontend, pas de reverse-proxy, pas de volume persistant pour `uploads/`. Inutilisable tel quel pour un déploiement complet — c'est un compose de développement local, pas de prod. |
| Persistance des preuves (`uploads/`) | ⚠️ À sécuriser | Stockage sur disque local — **choix assumé et documenté dans le cahier des charges lui-même** (§36.2 : "stockage local au début, puis S3 plus tard"). Mais tel quel, sans volume Docker persistant déclaré, un redéploiement du conteneur **efface toutes les preuves uploadées**. À monter en volume nommé/persistant avant toute mise en production, migration vers S3-compatible recommandée dès que le volume de preuves devient significatif. |
| CI/CD | ❌ Absent | Aucun dossier `.github/workflows` ni pipeline équivalent. Aucun test automatique ne tourne avant un merge — tout repose sur l'exécution manuelle de la suite. |
| Sauvegardes base de données | ❌ Non documenté | Aucune stratégie de backup Postgres (dump automatique, rétention, restauration testée) n'est présente dans le dépôt. À mettre en place au niveau infra avant la prod (ex. `pg_dump` planifié, ou snapshot managé si hébergé chez un cloud provider). |
| Variables d'environnement | ✅ Bien documentées | `.env.example` complet et README détaillé, mais aucune validation stricte au démarrage (voir section sécurité). |

---

## 4. Fiabilité & qualité du code

| Vérification | Résultat |
|---|---|
| Suite de tests backend | **212 / 212 passent** (exécution réelle à l'instant, contre une vraie base Postgres, aucun mock DB) |
| `alembic upgrade head` | Propre, aucune dérive entre modèles et migrations |
| Typecheck frontend (`tsc --noEmit`) | Propre, 0 erreur |
| Lint frontend (`eslint`) | Propre, 0 erreur |
| Build de production frontend (`next build`) | Réussi, 29 routes générées sans erreur |

C'est le point le plus rassurant du diagnostic : la logique métier (calculs de taux,
soldes collaborateurs, réconciliation dette/reliquat, permissions) est **correctement
testée et vérifiée en conditions réelles**, pas seulement en théorie.

---

## 5. Observabilité

| Point | État |
|---|---|
| Logs applicatifs structurés | ⚠️ Partiel — table `system_logs` en base (visible par le Super Admin), mais pas de log structuré exporté vers un agrégateur externe (ELK, Datadog, etc.) |
| Suivi d'erreurs (Sentry ou équivalent) | ❌ Absent |
| Alerting (erreurs 500 en rafale, base injoignable, etc.) | ❌ Absent |
| Métriques (latence, taux d'erreur, charge) | ❌ Absent |

Pour un MVP à faible volume avec un Super Admin qui consulte les logs manuellement,
c'est tolérable. Pour une mise en production réelle avec des entreprises qui dépendent
financièrement de la plateforme, **un minimum d'alerting sur les erreurs 500 et la
disponibilité de l'API est fortement recommandé dès le lancement**, pas après.

---

## 6. Performance & scalabilité

- Pas de Redis ni de cache (mentionné comme "recommandé" au §36.2 du cahier des
  charges, jamais implémenté) — non bloquant à l'échelle actuelle, mais à revisiter
  si le nombre d'entreprises/transactions augmente significativement.
- Le stockage de fichiers sur disque local (voir section 3) empêche une bascule
  simple vers plusieurs instances backend en parallèle (scaling horizontal) tant que
  ce n'est pas migré vers un stockage partagé (S3-compatible).
- Aucun test de charge n'a été effectué — les 212 tests couvrent la correction
  fonctionnelle, pas le comportement sous charge.

---

## 7. Ce qui doit être fait avant une mise en production réelle (bloquant)

1. **Générer un `JWT_SECRET_KEY` fort et unique**, différent de la valeur par défaut
   du dépôt, injecté via variable d'environnement/secret manager — jamais committé.
2. **Ajouter un garde-fou au démarrage** : refuser de lancer l'application si
   `ENVIRONMENT=production` et que `JWT_SECRET_KEY` vaut encore la valeur par défaut.
3. **Monter un volume persistant pour `uploads/`** dans la configuration de
   déploiement (docker-compose ou équivalent), pour ne pas perdre les preuves de
   paiement au moindre redéploiement.
4. **Mettre en place une sauvegarde automatique de la base Postgres**, avec une
   restauration déjà testée au moins une fois.
5. **Écrire un `docker-compose.prod.yml` (ou équivalent) complet** : backend,
   frontend, Postgres, reverse-proxy (nginx/Caddy pour HTTPS et en-têtes de
   sécurité), avec les secrets injectés proprement (pas en clair dans le fichier).

## 8. Fortement recommandé, non bloquant pour un premier lancement contrôlé

6. Ajouter un service d'alerting minimal sur les erreurs serveur (Sentry gratuit ou
   équivalent auto-hébergé) — la table `system_logs` existe déjà, il "suffit" de la
   brancher ou d'ajouter un hook d'envoi.
7. Ajouter un pipeline CI (GitHub Actions) qui fait tourner la suite de tests, le
   lint et le typecheck à chaque pull request, pour ne plus dépendre d'une exécution
   manuelle avant chaque merge.
8. Ajouter un rate limiting HTTP basique sur les endpoints d'authentification
   (`/auth/login`, `/auth/register`, `/auth/reset-password`) en plus du verrouillage
   par compte déjà en place.
9. Planifier la migration du stockage des preuves vers un stockage S3-compatible dès
   que le volume d'usage le justifie (déjà anticipé et budgété par le cahier des
   charges lui-même).
10. Revoir la durée de vie du refresh token (14 jours) à la lumière de l'absence de
    révocation — soit ajouter une liste de révocation, soit réduire la durée.

## 9. Ce qui n'a pas besoin d'être traité avant la mise en ligne

- Les écarts fonctionnels listés en section 1 (notifications email/SMS, export
  PDF/Excel natif, application mobile native) sont **explicitement hors MVP par le
  cahier des charges**, pas des manques à corriger dans l'urgence.
- Redis / cache : non nécessaire au volume actuel.

---

## Conclusion

D-Transfert est **fonctionnellement prêt** : la logique métier couvre fidèlement le
cahier des charges, elle est testée sérieusement (212 tests réels, pas de mocks sur
la base), et le build de production frontend est propre. Ce qui manque n'est pas du
développement de fonctionnalité mais du **durcissement d'exploitation** — secrets,
sauvegardes, persistance des fichiers, observabilité minimale. C'est un travail
d'infrastructure de l'ordre de 1 à 3 jours, pas une remise en cause du code existant.

**Recommandation** : traiter les 5 points bloquants de la section 7 avant toute
ouverture à de vrais utilisateurs avec de vrais fonds en jeu ; les points de la
section 8 peuvent suivre dans les semaines suivant le lancement.
