"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import type { NavItem } from "@/lib/nav";

export function QuickSearch({ items }: { items: NavItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const results = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative hidden w-full max-w-sm md:block">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder="Rechercher une section…"
        aria-label="Rechercher dans l'application"
        className="h-9 w-full rounded-lg border border-border/80 bg-card/70 pr-12 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/35 focus:bg-card focus:ring-3 focus:ring-primary/10"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        /
      </kbd>
      {open && query && (
        <div className="absolute top-11 right-0 left-0 z-50 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          {results.length > 0 ? (
            results.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {item.label}
              </Link>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">Aucun résultat</p>
          )}
        </div>
      )}
    </div>
  );
}
