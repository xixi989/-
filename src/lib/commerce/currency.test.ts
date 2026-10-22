import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import {
  BASE_CURRENCY,
  CURRENCIES,
  DEMO_RATES,
  convertCents,
  currencySymbol,
  formatAmount,
  formatUsd,
  isCurrency,
} from "./currency";

describe("convertCents", () => {
  it("returns the same amount for the base currency", () => {
    expect(convertCents(6800, "USD")).toBe(6800);
    expect(convertCents(0, "USD")).toBe(0);
  });

  it("applies the demonstration rate and rounds once", () => {
    expect(convertCents(6800, "EUR")).toBe(6256); // 6800 * 0.92
    expect(convertCents(6850, "GBP")).toBe(5412); // 5411.5 → 5412
    expect(convertCents(1, "GBP")).toBe(1); // 0.79 → 1
  });

  it("always returns an integer, so no float reaches the formatter", () => {
    for (const product of catalog) {
      for (const currency of CURRENCIES) {
        const converted = convertCents(product.price.amount, currency);
        expect(Number.isInteger(converted)).toBe(true);
        expect(converted).toBeGreaterThan(0);
      }
    }
  });

  it("never mutates the source amount", () => {
    const original = catalog[0].price.amount;
    convertCents(original, "EUR");
    expect(catalog[0].price.amount).toBe(original);
  });

  it("keeps USD as the base currency", () => {
    expect(BASE_CURRENCY).toBe("USD");
    expect(DEMO_RATES.USD).toBe(1);
    expect(DEMO_RATES.EUR).toBeLessThan(1);
    expect(DEMO_RATES.GBP).toBeLessThan(DEMO_RATES.EUR);
  });
});

describe("formatAmount", () => {
  it("drops decimals for whole amounts", () => {
    expect(formatAmount(6800, "USD")).toBe("$68");
    expect(formatAmount(48500, "USD")).toBe("$485");
  });

  it("keeps two decimals when there are cents", () => {
    expect(formatAmount(6256, "EUR")).toBe("€62.56");
  });

  it("places the symbol by currency, not by the source locale", () => {
    expect(formatAmount(6800, "GBP")).toBe("£68");
    expect(formatAmount(6800, "EUR")).toBe("€68");
  });

  it("formats a converted total in the target currency", () => {
    expect(formatUsd(6800, "EUR")).toBe("€62.56");
    expect(formatUsd(6800, "USD")).toBe("$68");
  });
});

describe("currencySymbol", () => {
  it("resolves the narrow symbol for each currency", () => {
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("GBP")).toBe("£");
  });
});

describe("isCurrency", () => {
  it("accepts the supported codes and rejects anything else", () => {
    expect(isCurrency("USD")).toBe(true);
    expect(isCurrency("GBP")).toBe(true);
    expect(isCurrency("JPY")).toBe(false);
    expect(isCurrency(undefined)).toBe(false);
    expect(isCurrency(null)).toBe(false);
  });
});
