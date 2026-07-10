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
  unreadNotifications,
  navItems,
  showNotifications = true,
}: {
  companyName: string;
  fullName: string;
  matricule: string;
  roleLabel: string;
  unreadNotifications: number;
  navItems: NavItem[];
  showNotifications?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-2xl lg:hidden">
            <Menu />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center px-4 text-sm font-semibold">D-Transfert</div>
          <SidebarNav items={navItems} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Console sécurisée
          </p>
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{companyName}</span>
            <Badge variant="secondary" className="hidden shrink-0 rounded-full px-2.5 py-0.5 sm:inline-flex">
              {roleLabel}
            </Badge>
          </div>
        </div>
        <Badge variant="outline" className="hidden shrink-0 rounded-full font-mono text-[11px] sm:inline-flex">
          {matricule}
        </Badge>
      </div>

        <div className="flex items-center gap-2">
          {showNotifications ? (
            <Button variant="ghost" size="icon" asChild className="relative rounded-2xl">
              <Link href="/notifications">
                <BellIcon />
                {unreadNotifications > 0 && (
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
            <Button variant="ghost" className="gap-2 rounded-2xl px-2.5">
              <Avatar className="size-8 ring-1 ring-border/70">
                <AvatarFallback>{initials(fullName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-2xl">
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
