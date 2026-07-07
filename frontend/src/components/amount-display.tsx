import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

const SIZE_CLASSES = {
  sm: "text-sm font-medium",
  md: "text-base font-semibold",
  lg: "text-xl font-semibold",
  xl: "text-2xl font-semibold",
} as const;

/**
 * Displays a financial amount with tabular numerals and, in `signed` mode,
 * an explicit +/- prefix and success/destructive coloring — so a user
 * scanning a table never has to infer direction from context alone.
 */
export function AmountDisplay({
  value,
  currency,
  signed = false,
  size = "sm",
  className,
}: {
  value: string | number;
  currency?: string;
  signed?: boolean;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const amount = typeof value === "string" ? Number(value) : value;
  const isNegative = signed && amount < 0;
  const isPositive = signed && amount > 0;
  const formatted = formatMoney(isNegative ? Math.abs(amount) : amount, currency);

  return (
    <span
      className={cn(
        "tabular-nums",
        SIZE_CLASSES[size],
        isNegative && "text-destructive",
        isPositive && "text-success",
        className
      )}
    >
      {isPositive && "+"}
      {isNegative && "−"}
      {formatted}
    </span>
  );
}
