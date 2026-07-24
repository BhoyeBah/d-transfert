"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import type { NotificationItem } from "@/types/api";

type NotificationsContextValue = {
  unreadCount: number;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// Bip synthétisé (Web Audio API) plutôt qu'un fichier audio embarqué : pas d'asset à charger,
// pas de problème de licence.
function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    // Un AudioContext peut démarrer "suspended" (politique anti-autoplay) : on programme quand
    // même la lecture immédiatement (elle joue dès que le contexte tourne, en rattrapant le
    // planning déjà posé) et on tente resume() en parallèle sans bloquer dessus — l'attendre
    // ferait ne jamais jouer le son si resume() ne se résout jamais.
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
    oscillator.onended = () => ctx.close();
  } catch {
    // Lecture audio indisponible (Web Audio absent, etc.) : ne doit jamais empêcher
    // l'affichage de la notification.
  }
}

/**
 * Pousse les notifications au fil de l'eau (SSE) plutôt que d'attendre que l'utilisateur
 * rafraîchisse la page. `initialUnreadCount` vient du rendu serveur (source de vérité au
 * chargement) ; les événements reçus ensuite l'incrémentent en direct. `enabled` désactive
 * complètement la connexion pour les comptes sans permission dashboard.view, qui recevraient
 * sinon un 401/403 en boucle.
 */
export function NotificationsProvider({
  initialUnreadCount,
  enabled,
  children,
}: {
  initialUnreadCount: number;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  // Resynchronise avec la valeur rendue côté serveur (source de vérité à chaque navigation)
  // sans passer par un effet : ajuster l'état pendant le rendu évite un rendu en cascade
  // superflu (cf. https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [syncedInitialCount, setSyncedInitialCount] = useState(initialUnreadCount);
  if (initialUnreadCount !== syncedInitialCount) {
    setSyncedInitialCount(initialUnreadCount);
    setUnreadCount(initialUnreadCount);
  }

  useEffect(() => {
    if (!enabled) return;

    const source = new EventSource("/api/notifications/stream");
    source.onmessage = (event) => {
      const notification = JSON.parse(event.data) as NotificationItem;
      setUnreadCount((count) => count + 1);
      toast.info(notification.message, { duration: 5000 });
      playNotificationSound();
    };

    // EventSource se reconnecte automatiquement après une coupure (comportement natif du
    // navigateur) : aucune logique de reconnexion manuelle n'est nécessaire ici.
    return () => source.close();
  }, [enabled]);

  return <NotificationsContext.Provider value={{ unreadCount }}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications doit être utilisé à l'intérieur de NotificationsProvider.");
  }
  return context;
}
