"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/types/commerce";
import { DEFAULT_CURRENCY, isCurrency } from "@/lib/commerce/currency";
import { DEFAULT_COUNTRY, recommendedCurrency, type CountryCode } from "@/lib/region";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

/**
 * Display preferences: currency, region and language. Kept in its own store so
 * it can never collide with the cart, wishlist or search state.
 */
interface PreferencesState {
  currency: CurrencyCode;
  country: CountryCode;
  locale: Locale;
  setCurrency: (currency: CurrencyCode) => void;
  /** Picking a region also applies its suggested currency, which the shopper can override. */
  setCountry: (country: CountryCode) => void;
  setLocale: (locale: Locale) => void;
  reset: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      country: DEFAULT_COUNTRY,
      locale: DEFAULT_LOCALE,

      setCurrency: (currency) => {
        if (!isCurrency(currency)) return;
        set({ currency });
      },

      setCountry: (country) => {
        const currency = recommendedCurrency(country);
        set({ country, currency });
      },

      setLocale: (locale) => {
        if (!isLocale(locale)) return;
        set({ locale });
      },

      reset: () => set({ currency: DEFAULT_CURRENCY, country: DEFAULT_COUNTRY, locale: DEFAULT_LOCALE }),
    }),
    {
      name: "aurel-preferences",
      version: 1,
      // A corrupt or partial record must not break the site: unknown values snap
      // back to the defaults instead of reaching Intl.NumberFormat.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PreferencesState>;
        return {
          ...current,
          currency: isCurrency(saved.currency) ? saved.currency : current.currency,
          country: saved.country === "US" || saved.country === "GB" || saved.country === "DE" || saved.country === "FR"
            ? saved.country
            : current.country,
          locale: isLocale(saved.locale) ? saved.locale : current.locale,
        };
      },
    },
  ),
);
