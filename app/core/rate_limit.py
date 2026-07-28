from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings


def get_client_ip(request: Request) -> str:
    """Clé de rate limiting basée sur la vraie IP cliente.

    Le backend n'est jamais exposé directement à Internet (seul le frontend Next.js
    l'appelle, via le réseau Docker interne) : sans ceci, `request.client.host` vaudrait
    systématiquement l'IP du conteneur frontend, et login/refresh/reset partageraient un
    seul quota entre tous les utilisateurs de toutes les entreprises au lieu d'un quota par
    attaquant. Le frontend relaie explicitement X-Forwarded-For (posé par Caddy en amont) —
    on peut lui faire confiance car aucun autre chemin n'atteint ce backend.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


# Stockage partagé (Redis) si REDIS_URL est configuré — nécessaire dès que plusieurs
# instances backend tournent derrière un load balancer, sinon chaque processus aurait son
# propre compteur et le rate limiting deviendrait inefficace. Sans REDIS_URL, repli sur un
# compteur en mémoire par processus (suffisant pour une seule instance, ex. développement).
limiter = Limiter(
    key_func=get_client_ip,
    enabled=True,
    storage_uri=get_settings().redis_url,
)
