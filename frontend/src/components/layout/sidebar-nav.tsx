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
  Percent,
  ScrollText,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavIconName, NavItem } from "@/lib/nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  percent: Percent,
};

const GROUPS = [
  { label: "Vue d'ensemble", paths: ["/dashboard"] },
  { label: "Opérations", paths: ["/wallets", "/national-operations", "/entries", "/transfers", "/payments"] },
  { label: "Relations", paths: ["/collaborations", "/private-rates", "/clients", "/suppliers"] },
  { label: "Pilotage", paths: ["/reports", "/employees", "/company"] },
] as const;

export function SidebarNav({
  items,
  onNavigate,
  collapsed = false,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col px-3", collapsed ? "gap-2" : "gap-5")} aria-label="Navigation principale">
      {GROUPS.map((group) => {
        const groupItems = group.paths
          .map((path) => items.find((item) => item.href === path))
          .filter((item): item is NavItem => Boolean(item));

        if (groupItems.length === 0) return null;

        return (
          <div key={group.label} className={cn("flex flex-col gap-1", collapsed && "border-b border-sidebar-border/60 pb-2 last:border-0")}>
            <p className={cn("px-3 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/35", collapsed && "sr-only")}>
              {group.label}
            </p>
            {groupItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = ICONS[item.icon];
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150",
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center text-sidebar-foreground/55 transition-colors",
                      isActive && "text-sidebar-primary"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (!collapsed) return link;

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
