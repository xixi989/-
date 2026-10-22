import type { CurrencyCode } from "@/types/commerce";

/**
 * Region is a *display* preference. It decides the suggested currency and the
 * label in the header — nothing else.
 *
 * It does not promise local shipping, local stock, tax handling or local
 * payment, because none of those exist in this demo. When Shopify Markets is
 * connected, this table becomes the mapping onto real market handles.
 */

export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const DEFAULT_COUNTRY: CountryCode = "US";

export interface Country {
  code: CountryCode;
  name: string;
  currency: CurrencyCode;
}

export function countryByCode(code: string | null | undefined): Country | null {
  if (!code) return null;
  return COUNTRIES.find((entry) => entry.code === code) ?? null;
}

export function recommendedCurrency(code: CountryCode): CurrencyCode {
  return countryByCode(code)?.currency ?? "USD";
}

export const REGION_NOTICE =
  "Region only changes how prices are shown. Shipping, duties and local payment are not configured in this demo.";
