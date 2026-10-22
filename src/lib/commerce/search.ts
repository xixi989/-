import { CATEGORY_LABELS } from "@/data/catalog";
import type { Product } from "@/types/commerce";

/**
 * Local search over the phase-2 catalogue. Deliberately dumb and readable:
 * token matching with field weights, no index, no fuzzy distance. At 25 products
 * that is both faster and more predictable than a search service.
 */

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

interface Field {
  text: string;
  weight: number;
}

function fieldsOf(product: Product): Field[] {
  return [
    { text: product.title.toLowerCase(), weight: 12 },
    { text: product.subtitle.toLowerCase(), weight: 7 },
    { text: CATEGORY_LABELS[product.category].toLowerCase(), weight: 7 },
    // Cross-listed products sit in more than one collection; searching a
    // collection name must find them too, not just its primary category.
    {
      text: product.collections.map((handle) => CATEGORY_LABELS[handle]).join(" ").toLowerCase(),
      weight: 7,
    },
    { text: product.colors.map((color) => color.name).join(" ").toLowerCase(), weight: 6 },
    { text: product.tags.join(" ").toLowerCase(), weight: 5 },
    { text: product.material.toLowerCase(), weight: 3 },
    { text: product.description.toLowerCase(), weight: 2 },
    { text: product.fit.toLowerCase(), weight: 1 },
  ];
}

function scoreProduct(product: Product, tokens: string[], phrase: string): number {
  const fields = fieldsOf(product);
  let score = 0;

  // Every token must land somewhere, otherwise "wool coat" would match all wool.
  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      if (field.text.includes(token)) best = Math.max(best, field.weight);
    }
    if (best === 0) return 0;
    score += best * 10;
  }

  if (product.title.toLowerCase().includes(phrase)) score += 80;
  if (fields.some((field) => field.text.includes(phrase))) score += 25;

  // A title that starts with the query is almost always the intended product.
  if (product.title.toLowerCase().startsWith(phrase)) score += 40;

  return score;
}

export interface SearchResult {
  product: Product;
  score: number;
}

export function rankProducts(products: Product[], query: string): SearchResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  const tokens = normalized.split(" ");

  return products
    .map((product) => ({ product, score: scoreProduct(product, tokens, normalized) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title));
}

export function searchProducts(products: Product[], query: string, limit?: number): Product[] {
  const ranked = rankProducts(products, query).map((entry) => entry.product);
  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}

/** Suggestions shown when the search field is still empty. */
export const SEARCH_SUGGESTIONS = [
  "Wool coat",
  "Cotton tee",
  "Knitwear",
  "Linen",
  "Leather",
] as const;
