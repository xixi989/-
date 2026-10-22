"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CurrencyCode, Money } from "@/types/commerce";
import { DEFAULT_CURRENCY, convertCents, formatAmount } from "@/lib/commerce/currency";
import { useIntlLocale } from "@/i18n/provider";
import { usePreferences } from "./store";

/**
 * Reads the display currency without breaking SSR: the server snapshot is USD,
 * so prerendered HTML is always the base currency and the switch happens after
 * hydration. That also keeps prices in the HTML aligned with the USD JSON-LD.
 */
export function useCurrency(): CurrencyCode {
  return useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().currency,
    () => DEFAULT_CURRENCY,
  );
}

/**
 * The single formatter for every price on the site. Amounts in the catalogue are
 * USD minor units; this converts once and formats once, so no component can drift.
 *
 * The number format follows the interface language (`de-DE` gives `66,24 €`),
 * while the currency itself follows the region selector. Always passing `en-US`
 * is what produced `€66.24` on a German page.
 */
export function usePrice(): (money: Money) => string {
  const currency = useCurrency();
  const locale = useIntlLocale();

  return useCallback(
    (money: Money) => formatAmount(convertCents(money.amount, currency), currency, locale),
    [currency, locale],
  );
}

/** Same formatter, for totals that are already plain USD minor units. */
export function useFormatUsdCents(): (usdCents: number) => string {
  const currency = useCurrency();
  const locale = useIntlLocale();

  return useCallback(
    (usdCents: number) => formatAmount(convertCents(usdCents, currency), currency, locale),
    [currency, locale],
  );
}
