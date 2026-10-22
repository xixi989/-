import { describe, expect, it } from "vitest";
import { LOCALES, DEFAULT_LOCALE, isLocale, INDEXABLE_LOCALES } from "./config";
import { dictionaries, translate } from "./dictionaries";

const enKeys = Object.keys(dictionaries.en).sort();

describe("dictionary completeness", () => {
  it("ships a dictionary for every supported locale", () => {
    for (const locale of LOCALES) {
      expect(dictionaries[locale]).toBeDefined();
    }
  });

  it("has the same keys in every language — no undefined translations", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(dictionaries[locale]).sort()).toEqual(enKeys);
    }
  });

  it("has no empty strings", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(dictionaries[locale])) {
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps placeholder tokens identical across languages", () => {
    const placeholders = (text: string) => (text.match(/\{[a-z]+\}/g) ?? []).sort();

    for (const key of enKeys) {
      const en = placeholders(dictionaries.en[key as keyof typeof dictionaries.en]);
      for (const locale of LOCALES) {
        const other = placeholders(dictionaries[locale][key as keyof typeof dictionaries.en]);
        expect(other, `${locale}.${key}`).toEqual(en);
      }
    }
  });
});

describe("translate", () => {
  it("returns the language's own string", () => {
    expect(translate("en", "cart.subtotal")).toBe("Subtotal");
    expect(translate("de", "cart.subtotal")).toBe("Zwischensumme");
  });

  it("interpolates variables", () => {
    expect(translate("en", "cart.items", { n: 3 })).toBe("3 items");
    expect(translate("de", "cart.items", { n: 3 })).toBe("3 Artikel");
    expect(translate("en", "cart.freeShippingRemaining", { amount: "$78" })).toContain("$78");
  });

  it("leaves the template untouched when no variables are supplied", () => {
    expect(translate("en", "cart.items")).toBe("{n} items");
  });

  it("falls back to English for a locale that somehow has no entry", () => {
    expect(translate("en", "nav.women")).toBe("Women");
  });
});

describe("locale config", () => {
  it("uses English as the default and the only indexed language", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(INDEXABLE_LOCALES).toEqual(["en"]);
  });

  it("validates locale codes", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
