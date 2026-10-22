/**
 * Locale plumbing. English is the only language with its own URLs; German is a
 * UI preview (see DISPLAY_LOCALES), which is why there is no hreflang anywhere:
 * claiming a German version of a page that has no German URL would be a lie to
 * crawlers.
 */

export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Languages that a visitor can switch to in the UI. */
export const DISPLAY_LOCALES: Locale[] = ["en", "de"];

/** Locales with indexable, URL-addressable content. */
export const INDEXABLE_LOCALES: Locale[] = ["en"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** BCP-47 tags used for Intl formatting and the <html lang> attribute. */
export const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
};
