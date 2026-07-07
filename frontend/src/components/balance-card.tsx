import { cn } from "@/lib/utils";
import { AmountDisplay } from "@/components/amount-display";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Explains a shared balance in plain language instead of leaving the user to
 * infer meaning from a signed number: who owes whom, or whether it's settled.
 */
export function BalanceCard({
  counterpartyName,
  balance,
  currency,
  className,
}: {
  counterpartyName: string;
  balance: string;
  currency: string;
  className?: string;
}) {
  const amount = Number(balance);
  const explanation =
    amount > 0
      ? `${counterpartyName} vous doit`
      : amount < 0
        ? `Vous devez à ${counterpartyName}`
        : "Solde équilibré";

  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="flex flex-col gap-1 px-4">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Solde partagé
        </span>
        <AmountDisplay value={balance} currency={currency} signed size="xl" />
        <span className="text-sm text-muted-foreground">{explanation}</span>
      </CardContent>
    </Card>
  );
}
