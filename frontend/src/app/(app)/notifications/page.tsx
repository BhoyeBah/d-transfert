import type { Metadata } from "next";

import { listNotifications } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkNotificationReadButton } from "./mark-read-button";

export const metadata: Metadata = { title: "Notifications — D-Transfert" };

export default async function NotificationsPage() {
  const notifications = await listNotifications();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Demandes de collaboration, envois et paiements à traiter.
        </p>
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune notification.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.is_read ? "opacity-60" : undefined}>
              <CardContent className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-start gap-2">
                    {!notification.is_read && <Badge className="mt-0.5 shrink-0">Nouveau</Badge>}
                    <span className="text-sm">{notification.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                {!notification.is_read && (
                  <div className="self-start sm:self-auto">
                    <MarkNotificationReadButton notificationId={notification.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
