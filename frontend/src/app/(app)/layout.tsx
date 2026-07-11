import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCompanyMe } from "@/lib/data/company";
import { getMe } from "@/lib/data/me";
import { getDashboard } from "@/lib/data/dashboard";
import { NAV_ITEMS } from "@/lib/nav";
import { hasPermission } from "@/lib/permissions";
import { ApiError, UnauthenticatedError } from "@/lib/api-error";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let me: Awaited<ReturnType<typeof getMe>>;
  let companyName: string;
  let unreadNotifications = 0;

  try {
    [me, companyName] = await Promise.all([
      getMe(),
      getCompanyMe().then((company) => company.name),
    ]);
    // Le compteur de notifications passe par le endpoint dashboard, qui exige la permission
    // dashboard.view — celle-ci n'est pas garantie pour tous les utilisateurs pouvant se
    // connecter (un employé peut n'avoir que transfer.create, par exemple). Comme ce layout
    // enveloppe TOUTES les pages, une erreur ici ferait planter l'application entière : on
    // dégrade simplement le compteur à 0 plutôt que de bloquer l'accès.
    try {
      unreadNotifications = (await getDashboard()).unread_notifications_count;
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 403)) throw error;
    }
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login");
    }
    throw error;
  }

  const navItems = NAV_ITEMS.filter(
    (item) =>
      item.requiredPermission === null ||
      hasPermission(me.permissions, me.is_owner, me.is_super_admin, item.requiredPermission)
  );

  const roleLabel = me.is_super_admin ? "Super Admin" : me.is_owner ? "Owner" : "Employé";

  return (
    <AppShell
      navItems={navItems}
      companyName={companyName}
      fullName={me.full_name}
      matricule={me.matricule}
      roleLabel={roleLabel}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AppShell>
  );
}
