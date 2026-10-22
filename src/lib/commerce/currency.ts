import type { CurrencyCode } from "@/types/commerce";

/**
 * Multi-currency, display only.
 *
 * The catalogue prices in USD minor units and nothing in the app ever mutates
 * them. EUR and GBP are derived at render time from a fixed demonstration rate,
 * so a currency switch cannot change a SKU, a stock level or a cart total's
 * underlying value — only how it is written on screen.
 *
 * Important honesty constraint: this is not settled multi-currency. Checkout is
 * not connected, so no EUR/GBP order can exist. The UI says so wherever a total
 * is shown in a converted currency.
 */

export const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP"];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/**
 * Demonstration rates, pinned on purpose. Replace with a cached feed (Shopify
 * Markets, ECB, OXR) before any real launch — the rest of the app only calls
 * `convertCents`, so this table is the single swap point.
 */
export const DEMO_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export const BASE_CURRENCY: CurrencyCode = "USD";

/** Shown next to every converted price block. Never claim these are live. */
export const RATE_NOTICE =
  "Reference prices converted from USD at a demonstration rate. Not a live market rate, and not a settlement currency.";

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
};

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (CURRENCIES as string[]).includes(value);
}

/**
 * Converts USD minor units into the target currency's minor units.
 * Rounds once, at the end, to an integer — no float ever reaches the formatter.
 */
export function convertCents(usdCents: number, target: CurrencyCode): number {
  if (target === BASE_CURRENCY) return Math.round(usdCents);
  return Math.round(usdCents * DEMO_RATES[target]);
}

/**
 * Formats minor units with Intl. Whole amounts drop the decimals, which is how
 * apparel is priced; anything with cents keeps exactly two.
 */
export function formatAmount(
  minorUnits: number,
  currency: CurrencyCode,
  locale = "en-US",
): string {
  const fractionDigits = minorUnits % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(minorUnits / 100);
}

/** USD minor units straight to a formatted string in the display currency. */
export function formatUsd(
  usdCents: number,
  display: CurrencyCode,
  locale = "en-US",
): string {
  return formatAmount(convertCents(usdCents, display), display, locale);
}

/** `USD` → `$`, used in compact labels where the ISO code is too wide. */
export function currencySymbol(currency: CurrencyCode, locale = "en-US"): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value ?? currency;
}
