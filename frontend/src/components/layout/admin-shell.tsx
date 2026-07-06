import { Menu, LogOut, ShieldAlert } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function AdminShell({ fullName, children }: { fullName: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-14 items-center gap-2 px-5 text-sm font-semibold tracking-tight">
          <ShieldAlert className="size-4" />
          D-Transfert Admin
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <AdminNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="sr-only">Navigation admin</SheetTitle>
              <div className="flex h-14 items-center px-4 text-sm font-semibold">D-Transfert Admin</div>
              <AdminNav />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium">Administration plateforme</span>
          </div>

          <span className="hidden text-sm text-muted-foreground sm:inline">{fullName}</span>

          <ThemeToggle />

          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon">
              <LogOut />
              <span className="sr-only">Se déconnecter</span>
            </Button>
          </form>
        </header>
        <main className="flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
