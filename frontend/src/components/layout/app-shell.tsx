import { AppTopbar } from "@/components/layout/app-topbar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { NavItem } from "@/lib/nav";

export function AppShell({
  navItems,
  companyName,
  fullName,
  matricule,
  roleLabel,
  unreadNotifications,
  showNotifications = true,
  children,
}: {
  navItems: NavItem[];
  companyName: string;
  fullName: string;
  matricule: string;
  roleLabel: string;
  unreadNotifications: number;
  showNotifications?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell-frame flex min-h-screen overflow-hidden">
      <aside className="relative hidden w-72 shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] backdrop-blur lg:flex">
        <div className="border-b border-sidebar-border/70 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary/15 text-sm font-semibold text-sidebar-primary shadow-sm">
              D
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                D-Transfert
              </div>
              <div className="text-xs text-sidebar-foreground/60">
                Console de trésorerie multi-entreprises
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/60 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-primary">
              Session active
            </div>
            <div className="mt-1 text-sm font-medium text-sidebar-accent-foreground">{companyName}</div>
            <div className="text-xs text-sidebar-foreground/60">{roleLabel}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <SidebarNav items={navItems} />
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <AppTopbar
          companyName={companyName}
          fullName={fullName}
          matricule={matricule}
          roleLabel={roleLabel}
          unreadNotifications={unreadNotifications}
          navItems={navItems}
          showNotifications={showNotifications}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
