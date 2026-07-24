"use client";

import { useSyncExternalStore } from "react";
import { Menu } from "lucide-react";

import { AppTopbar } from "@/components/layout/app-topbar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

function subscribeToSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("sidebar-state-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sidebar-state-change", callback);
  };
}

function getSidebarSnapshot() {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getServerSidebarSnapshot() {
  return false;
}

export function AppShell({
  navItems,
  companyName,
  fullName,
  matricule,
  roleLabel,
  showNotifications = true,
  children,
}: {
  navItems: NavItem[];
  companyName: string;
  fullName: string;
  matricule: string;
  roleLabel: string;
  showNotifications?: boolean;
  children: React.ReactNode;
}) {
  const sidebarCollapsed = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );

  function toggleSidebar() {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed));
    window.dispatchEvent(new Event("sidebar-state-change"));
  }

  return (
    <div className="app-shell-frame flex min-h-screen overflow-hidden">
      <aside
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out lg:flex",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("border-b border-sidebar-border/70 py-5", sidebarCollapsed ? "px-3" : "px-4")}>
          <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-3" : "gap-3")}>
            <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              DT
            </div>
            <div className={cn("min-w-0 flex-1", sidebarCollapsed && "hidden")}>
              <div className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                D-Transfert
              </div>
              <div className="text-[11px] text-sidebar-foreground/55">
                Gestion financière
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Ouvrir la navigation" : "Réduire la navigation"}
              aria-expanded={!sidebarCollapsed}
              className="size-9 text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav items={navItems} collapsed={sidebarCollapsed} />
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <AppTopbar
          companyName={companyName}
          fullName={fullName}
          matricule={matricule}
          roleLabel={roleLabel}
          navItems={navItems}
          showNotifications={showNotifications}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="page-content mx-auto flex w-full max-w-[1400px] flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
