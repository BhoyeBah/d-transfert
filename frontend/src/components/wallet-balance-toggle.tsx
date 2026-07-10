"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { AmountDisplay } from "@/components/amount-display";
import { Button } from "@/components/ui/button";

export function WalletBalanceToggle({ value, currency }: { value: string; currency: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {visible ? (
        <AmountDisplay value={value} currency={currency} size="lg" />
      ) : (
        <span className="select-none text-lg font-semibold tracking-widest text-muted-foreground">
          •••••
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Cacher le solde" : "Afficher le solde"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
