import type { CurrencyCode, Money } from "@/types/commerce";

/**
 * Presentation stays here; calculation stays in the commerce layer.
 * Phase 5 adds EUR/GBP by swapping `locale` and the currency code only.
 */
const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
};

/** `$68` for whole amounts, `$68.50` when there are cents. */
export function formatMoney(money: Money): string {
  const locale = LOCALE_BY_CURRENCY[money.currency];
  const fractionDigits = money.amount % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(money.amount / 100);
}

/** Stable two-digit index for editorial numbering: 01, 02, … */
export function padIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}
