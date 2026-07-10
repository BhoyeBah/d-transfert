"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  FileClock,
  HandCoins,
  LayoutDashboard,
  Landmark,
  ScrollText,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavIconName, NavItem } from "@/lib/nav";

const ICONS: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  wallet: Wallet,
  landmark: Landmark,
  "scroll-text": ScrollText,
  "arrow-left-right": ArrowLeftRight,
  "hand-coins": HandCoins,
  building: Building2,
  users: Users,
  truck: Truck,
  "file-clock": FileClock,
  "shield-check": ShieldCheck,
  bell: Bell,
};

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/70"
                : "text-sidebar-foreground/72 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-xl border border-transparent bg-sidebar-accent/40 text-sidebar-foreground/70 transition-colors",
                isActive && "border-sidebar-border/70 bg-sidebar-primary/15 text-sidebar-primary"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
