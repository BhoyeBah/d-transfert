export function normalizeCurrencies(currencies: string[]): string[] {
  return Array.from(
    new Set(
      currencies
        .map((currency) => currency.trim().toUpperCase())
        .filter((currency) => currency.length > 0)
    )
  );
}

export function mergeCurrencies(primary: string[], secondary?: string | null): string[] {
  const currencies = [...primary];
  if (secondary) {
    currencies.push(secondary);
  }
  return normalizeCurrencies(currencies);
}
