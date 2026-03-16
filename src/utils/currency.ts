export const CURRENCY_OPTIONS = [
  { code: "PKR", symbol: "Rs", label: "Pakistani Rupee (PKR)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (AED)" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal (SAR)" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

export function getCurrencySymbol(code: string): string {
  const currency = CURRENCY_OPTIONS.find((c) => c.code === code);
  return currency ? currency.symbol : code;
}
