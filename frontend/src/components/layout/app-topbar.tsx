"use client";

import Link from "next/link";
import { Menu, LogOut, BellIcon } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { QuickSearch } from "@/components/layout/quick-search";
import { useNotifications } from "@/components/layout/notifications-provider";
import type { NavItem } from "@/lib/nav";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppTopbar({
  companyName,
  fullName,
  matricule,
  roleLabel,
  navItems,
  showNotifications = true,
}: {
  companyName: string;
  fullName: string;
  matricule: string;
  roleLabel: string;
  navItems: NavItem[];
  showNotifications?: boolean;
}) {
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
            <Menu />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-sidebar-border px-4 text-sm font-semibold">D-Transfert</div>
          <SidebarNav items={navItems} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Espace entreprise
          </p>
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{companyName}</span>
            <Badge variant="secondary" className="hidden shrink-0 px-2.5 py-0.5 sm:inline-flex">
              {roleLabel}
            </Badge>
          </div>
        </div>
        <Badge variant="outline" className="hidden shrink-0 font-mono text-[11px] sm:inline-flex">
          {matricule}
        </Badge>
      </div>

        <QuickSearch items={navItems} />

        <div className="flex items-center gap-2">
          {showNotifications ? (
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/notifications">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex size-2 rounded-full bg-destructive" />
                )}
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
          ) : (
            <div className="hidden size-9 sm:block" />
          )}

          <ThemeToggle />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2.5">
              <Avatar className="size-8 ring-1 ring-border/70">
                <AvatarFallback>{initials(fullName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">{fullName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {matricule} · {roleLabel}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem asChild variant="destructive">
                <button type="submit" className="w-full">
                  <LogOut />
                  Se déconnecter
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
