import type { CategoryHandle, Product, ProductSummary, SizeCode } from "@/types/commerce";

/**
 * The seam between the storefront and whatever is selling the clothes.
 *
 * Phase 2 ships `MockCommerceAdapter` over the local catalogue. A Shopify
 * Storefront adapter implements this same interface later; no component imports
 * the mock directly, so the swap is a one-line change in `lib/commerce/index.ts`.
 */
export interface CommerceAdapter {
  listProducts(collection?: CategoryHandle): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  getRelatedProducts(slug: string, limit?: number): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
}

export function toSummary(product: Product): ProductSummary {
  const defaultColorSlug = firstAvailableColorSlug(product);
  const defaultColor =
    product.colors.find((color) => color.slug === defaultColorSlug) ?? product.colors[0];

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    categoryLabel: categoryLabelFor(product),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    colors: product.colors.map(({ name, slug, hex }) => ({ name, slug, hex })),
    images: defaultColor.images,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    soldOut: isSoldOut(product),
    defaultColorSlug,
    defaultColorName: defaultColor.name,
    sizeStock: sizesForColor(product, defaultColorSlug).map(
      ({ size, variantId, inStock, inventory }) => ({ size, variantId, inStock, inventory }),
    ),
  };
}

const CATEGORY_LABEL: Record<CategoryHandle, string> = {
  women: "Women",
  men: "Men",
  knitwear: "Knitwear",
  shirts: "Shirts",
  trousers: "Trousers",
  outerwear: "Outerwear",
  accessories: "Accessories",
};

function categoryLabelFor(product: Product): string {
  return CATEGORY_LABEL[product.category];
}

/** Every variant is out of stock. */
export function isSoldOut(product: Product): boolean {
  return product.variants.every((variant) => variant.inventory <= 0);
}

/** Look up the exact purchasable line item for a colour/size pair. */
export function findVariant(product: Product, colorSlug: string, size: SizeCode) {
  return product.variants.find(
    (variant) => variant.colorSlug === colorSlug && variant.size === size,
  );
}

/** Sizes offered in a colourway, with stock attached — drives the size chips. */
export function sizesForColor(product: Product, colorSlug: string) {
  return product.sizes.map((size) => {
    const variant = findVariant(product, colorSlug, size);
    const inventory = variant?.inventory ?? 0;
    return {
      size,
      variantId: variant?.id ?? null,
      inventory,
      inStock: inventory > 0,
      lowStock: inventory > 0 && inventory <= 2,
    };
  });
}

/** A colourway is selectable while at least one of its sizes has stock. */
export function isColorAvailable(product: Product, colorSlug: string): boolean {
  return product.variants.some(
    (variant) => variant.colorSlug === colorSlug && variant.inventory > 0,
  );
}

/** First colour that can actually be bought — used as the PDP default. */
export function firstAvailableColorSlug(product: Product): string {
  const found = product.colors.find((color) => isColorAvailable(product, color.slug));
  return (found ?? product.colors[0]).slug;
}

/** True when the product offers the size in any colour, ignoring stock. */
export function offersSize(product: Product, size: SizeCode): boolean {
  return product.variants.some((variant) => variant.size === size);
}
