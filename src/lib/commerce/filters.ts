import { SIZE_CODES, type Product, type SizeCode } from "@/types/commerce";

/**
 * Filtering and sorting are pure functions over products, with no React and no
 * URL knowledge, so they can be unit-tested directly. The URL is just one place
 * these values get stored.
 */

export const SORT_KEYS = ["featured", "price-asc", "price-desc", "newest"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const DEFAULT_SORT: SortKey = "featured";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export interface PriceBand {
  id: string;
  label: string;
  /** Minor units, inclusive. */
  min: number;
  /** `null` means open-ended. */
  max: number | null;
}

export const PRICE_BANDS: PriceBand[] = [
  { id: "under-100", label: "Under $100", min: 0, max: 10000 },
  { id: "100-200", label: "$100 – $200", min: 10000, max: 20000 },
  { id: "over-200", label: "$200 and above", min: 20000, max: null },
];

export interface ProductFilters {
  colors: string[];
  sizes: SizeCode[];
  priceBands: string[];
}

export const EMPTY_FILTERS: ProductFilters = { colors: [], sizes: [], priceBands: [] };

function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseSort(params: URLSearchParams): SortKey {
  const value = params.get("sort");
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : DEFAULT_SORT;
}

export function parseFilters(params: URLSearchParams): ProductFilters {
  const sizes = splitList(params.get("size")).filter((size): size is SizeCode =>
    (SIZE_CODES as readonly string[]).includes(size),
  );
  const priceBands = splitList(params.get("price")).filter((band) =>
    PRICE_BANDS.some((entry) => entry.id === band),
  );

  return {
    colors: splitList(params.get("color")),
    sizes,
    priceBands,
  };
}

/** Builds the query string for a filtered view, omitting defaults. */
export function buildQuery(filters: ProductFilters, sort: SortKey): string {
  const parts: string[] = [];
  // Commas stay literal: these URLs get read, pasted and shared, and `%2C`
  // everywhere makes a filtered view look like machine noise.
  const list = (values: string[]) => values.join(",");

  if (filters.colors.length) parts.push(`color=${list([...filters.colors].sort())}`);
  if (filters.sizes.length) {
    parts.push(`size=${list(SIZE_CODES.filter((size) => filters.sizes.includes(size)))}`);
  }
  if (filters.priceBands.length) {
    parts.push(`price=${list([...filters.priceBands].sort())}`);
  }
  if (sort !== DEFAULT_SORT) parts.push(`sort=${sort}`);

  return parts.length ? `?${parts.join("&")}` : "";
}

export function activeFilterCount(filters: ProductFilters): number {
  return filters.colors.length + filters.sizes.length + filters.priceBands.length;
}

export function isFiltering(filters: ProductFilters): boolean {
  return activeFilterCount(filters) > 0;
}

/** Add or remove a value, preserving the caller's ordering rules. */
export function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function matchesPrice(product: Product, selected: string[]): boolean {
  if (!selected.length) return true;
  return selected.some((id) => {
    const band = PRICE_BANDS.find((entry) => entry.id === id);
    if (!band) return false;
    const amount = product.price.amount;
    return amount >= band.min && (band.max === null || amount < band.max);
  });
}

function matchesColor(product: Product, selected: string[]): boolean {
  if (!selected.length) return true;
  return product.colors.some((color) => selected.includes(color.slug));
}

/**
 * A size filter means "I could actually buy this in that size" — offering the
 * size but being sold out everywhere does not count, otherwise the result is a
 * grid of things you cannot add to the bag.
 */
function matchesSize(product: Product, selected: SizeCode[]): boolean {
  if (!selected.length) return true;
  return selected.every((size) =>
    product.variants.some((variant) => variant.size === size && variant.inventory > 0),
  );
}

export function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(
    (product) =>
      matchesColor(product, filters.colors) &&
      matchesSize(product, filters.sizes) &&
      matchesPrice(product, filters.priceBands),
  );
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];

  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return copy.sort((a, b) => b.price.amount - a.price.amount);
    case "newest":
      return copy.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    case "featured":
    default:
      return copy.sort((a, b) => {
        if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        return b.releasedAt.localeCompare(a.releasedAt);
      });
  }
}

export function filterAndSort(
  products: Product[],
  filters: ProductFilters,
  sort: SortKey,
): Product[] {
  return sortProducts(applyFilters(products, filters), sort);
}

export interface ColorFacet {
  slug: string;
  name: string;
  hex: string;
  count: number;
}

/** Facets come from the unfiltered collection so they never disappear mid-filter. */
export function colorFacets(products: Product[]): ColorFacet[] {
  const map = new Map<string, ColorFacet>();
  for (const product of products) {
    for (const color of product.colors) {
      const existing = map.get(color.slug);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(color.slug, {
          slug: color.slug,
          name: color.name,
          hex: color.hex,
          count: 1,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function sizeFacets(products: Product[]): SizeCode[] {
  const present = new Set<SizeCode>();
  for (const product of products) {
    for (const size of product.sizes) present.add(size);
  }
  return SIZE_CODES.filter((size) => present.has(size));
}
