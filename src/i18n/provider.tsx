"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { usePreferences } from "@/lib/preferences/store";
import { DEFAULT_LOCALE, INTL_LOCALES, type Locale } from "./config";
import { translate, type DictionaryKey } from "./dictionaries";

export type Translate = (key: DictionaryKey, vars?: Record<string, string | number>) => string;

interface LocaleContextValue {
  locale: Locale;
  /** BCP-47 tag for Intl (dates, numbers, currency placement). */
  intlLocale: string;
  t: Translate;
}

const fallback: LocaleContextValue = {
  locale: DEFAULT_LOCALE,
  intlLocale: INTL_LOCALES[DEFAULT_LOCALE],
  t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
};

const LocaleContext = createContext<LocaleContextValue>(fallback);

/**
 * Locale lives in localStorage, like the cart, so it needs the same treatment:
 * a server snapshot of English keeps SSR markup and the first paint identical,
 * then the stored language applies. `<html lang>` follows on the client — English
 * remains the only indexed language, so the document that crawlers read is English.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().locale,
    () => DEFAULT_LOCALE,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      intlLocale: INTL_LOCALES[locale],
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): Translate {
  return useContext(LocaleContext).t;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useIntlLocale(): string {
  return useContext(LocaleContext).intlLocale;
}
