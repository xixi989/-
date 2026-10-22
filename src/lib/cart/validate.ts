import { catalog } from "@/data/catalog";
import type { CartLine, Money, ProductImage, Product, SizeCode } from "@/types/commerce";

/**
 * The cart stores a snapshot of what the shopper chose. The catalogue is the
 * only source of truth for price and stock, so every read reconciles the two.
 * Nothing here mutates the catalogue — a stale cart is corrected, never trusted.
 */

export interface VariantSnapshot {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  colorName: string;
  colorSlug: string;
  size: SizeCode;
  price: Money;
  inventory: number;
  image: ProductImage;
}

export type VariantIndex = Map<string, VariantSnapshot>;

export function buildVariantIndex(products: Product[]): VariantIndex {
  const index: VariantIndex = new Map();

  for (const product of products) {
    for (const variant of product.variants) {
      const color = product.colors.find((entry) => entry.slug === variant.colorSlug);
      index.set(variant.id, {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        title: product.title,
        colorName: color?.name ?? variant.colorSlug,
        colorSlug: variant.colorSlug,
        size: variant.size,
        price: variant.price,
        inventory: variant.inventory,
        image: color?.images[0] ?? product.colors[0].images[0],
      });
    }
  }

  return index;
}

let cached: VariantIndex | null = null;

/** Built once per session from the single catalogue module. */
export function getVariantIndex(): VariantIndex {
  cached ??= buildVariantIndex(catalog);
  return cached;
}

export function getVariantSnapshot(variantId: string): VariantSnapshot | undefined {
  return getVariantIndex().get(variantId);
}

export type RemovalReason = "missing" | "sold-out";
export type AdjustmentReason = "stock" | "price";

export interface ReconciledCart {
  lines: CartLine[];
  removed: Array<{ variantId: string; title: string; reason: RemovalReason }>;
  adjusted: Array<{ variantId: string; title: string; from: number; to: number; reason: AdjustmentReason }>;
}

/**
 * Heals a cart restored from localStorage:
 * - SKUs that no longer exist are dropped (never render a ghost line),
 * - sold-out SKUs are dropped,
 * - quantities are clamped to current stock,
 * - price and presentation fields are refreshed from the catalogue.
 */
export function reconcileLines(lines: CartLine[], index: VariantIndex): ReconciledCart {
  const kept: CartLine[] = [];
  const removed: ReconciledCart["removed"] = [];
  const adjusted: ReconciledCart["adjusted"] = [];

  for (const line of lines) {
    const snapshot = index.get(line.variantId);

    if (!snapshot) {
      removed.push({ variantId: line.variantId, title: line.title, reason: "missing" });
      continue;
    }

    if (snapshot.inventory <= 0) {
      removed.push({ variantId: line.variantId, title: snapshot.title, reason: "sold-out" });
      continue;
    }

    const quantity = Math.min(line.quantity, snapshot.inventory);
    if (quantity !== line.quantity) {
      adjusted.push({
        variantId: line.variantId,
        title: snapshot.title,
        from: line.quantity,
        to: quantity,
        reason: "stock",
      });
    }

    if (line.unitPrice.amount !== snapshot.price.amount) {
      adjusted.push({
        variantId: line.variantId,
        title: snapshot.title,
        from: line.unitPrice.amount,
        to: snapshot.price.amount,
        reason: "price",
      });
    }

    kept.push({
      ...line,
      sku: snapshot.variantId,
      productId: snapshot.productId,
      slug: snapshot.slug,
      title: snapshot.title,
      colorName: snapshot.colorName,
      colorSlug: snapshot.colorSlug,
      size: snapshot.size,
      unitPrice: snapshot.price,
      quantity,
      image: snapshot.image,
      maxQuantity: snapshot.inventory,
    });
  }

  return { lines: kept, removed, adjusted };
}

export type LineStatus =
  | { kind: "ok"; maxQuantity: number }
  | { kind: "low-stock"; maxQuantity: number }
  | { kind: "missing" }
  | { kind: "sold-out" }
  | { kind: "over-stock"; maxQuantity: number };

/**
 * Per-line status for rendering. Unlike `reconcileLines` this never mutates, so
 * the UI can explain a problem instead of silently fixing it.
 */
export function lineStatus(line: CartLine, index: VariantIndex): LineStatus {
  const snapshot = index.get(line.variantId);
  if (!snapshot) return { kind: "missing" };
  if (snapshot.inventory <= 0) return { kind: "sold-out" };
  if (line.quantity > snapshot.inventory) {
    return { kind: "over-stock", maxQuantity: snapshot.inventory };
  }
  if (snapshot.inventory <= 2) return { kind: "low-stock", maxQuantity: snapshot.inventory };
  return { kind: "ok", maxQuantity: snapshot.inventory };
}
