/**
 * Commerce domain types.
 *
 * Money is stored in minor units (cents) so arithmetic stays integer-safe; see
 * `lib/format.ts` for presentation and `lib/commerce` for calculations.
 *
 * The UI depends on these shapes only — never on where the data came from. The
 * mock adapter ships in phase 2; a Shopify Storefront adapter can be dropped in
 * later without touching a component.
 */

export type CurrencyCode = "USD" | "EUR" | "GBP";

export interface Money {
  /** e.g. 6800 → $68.00 */
  amount: number;
  currency: CurrencyCode;
}

export const SIZE_CODES = ["XS", "S", "M", "L", "XL"] as const;
export type SizeCode = (typeof SIZE_CODES)[number];

export const CATEGORY_HANDLES = [
  "women",
  "men",
  "knitwear",
  "shirts",
  "trousers",
  "outerwear",
  "accessories",
] as const;
export type CategoryHandle = (typeof CATEGORY_HANDLES)[number];

export interface ProductImage {
  src: string;
  alt: string;
  /** Focal point for non-uniform crops, as a CSS object-position value. */
  objectPosition?: string;
}

export interface ProductColor {
  /** Display name, e.g. "Heather Moss". */
  name: string;
  /** Stable URL-safe key used in filters, SKUs and variant lookup. */
  slug: string;
  /** Swatch colour is presentation only — never used for price or stock logic. */
  hex: string;
  /** Colourway photography. The first entry is the colour's primary frame. */
  images: [ProductImage, ...ProductImage[]];
}

export interface ProductVariant {
  /** Line-item identity: what the cart stores. Never the product id. */
  id: string;
  sku: string;
  colorSlug: string;
  size: SizeCode;
  price: Money;
  compareAtPrice?: Money;
  /** Units on hand. 0 means sold out for this colour/size combination. */
  inventory: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Primary category, drives the breadcrumb and the default collection. */
  category: CategoryHandle;
  /** Every collection this product belongs to, including cross-links. */
  collections: CategoryHandle[];
  tags: string[];
  /** Display price — the lowest variant price. */
  price: Money;
  compareAtPrice?: Money;
  colors: ProductColor[];
  sizes: SizeCode[];
  variants: ProductVariant[];
  material: string;
  careInstructions: string[];
  fit: string;
  isNew: boolean;
  isBestSeller: boolean;
  /** ISO date, used by the "newest" sort. */
  releasedAt: string;
}

/** Trimmed shape for grids, so listing pages never ship the full variant matrix. */
export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categoryLabel: string;
  price: Money;
  compareAtPrice?: Money;
  colors: Array<Pick<ProductColor, "name" | "slug" | "hex">>;
  images: [ProductImage, ...ProductImage[]];
  isNew: boolean;
  isBestSeller: boolean;
  /** True when every variant is out of stock. */
  soldOut: boolean;
  /** Colour Quick Add defaults to: the first one that can actually be bought. */
  defaultColorSlug: string;
  defaultColorName: string;
  /** Stock for the default colour only — that is all Quick Add needs. */
  sizeStock: Array<{
    size: SizeCode;
    variantId: string | null;
    inStock: boolean;
    inventory: number;
  }>;
}

export type CollectionHandle = "women" | "men";

export interface CollectionEntry {
  handle: CollectionHandle;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: ProductImage;
}

export interface CollectionMeta {
  handle: CategoryHandle;
  title: string;
  description: string;
}

/** One line in the cart. Built from a variant, never from a product alone. */
export interface CartLine {
  variantId: string;
  sku: string;
  productId: string;
  slug: string;
  title: string;
  colorName: string;
  colorSlug: string;
  size: SizeCode;
  unitPrice: Money;
  quantity: number;
  image: ProductImage;
  /** Snapshot of what was in stock when added, for quantity clamping. */
  maxQuantity: number;
}
