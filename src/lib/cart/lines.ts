import type { CartLine, Product, ProductSummary, ProductVariant, SizeCode } from "@/types/commerce";

/**
 * Only these two functions may turn a product into a cart line. Both require a
 * concrete variant, which is what guarantees the cart stores a SKU rather than
 * a product name and a hope.
 */

export function lineFromVariant(
  product: Product,
  variant: ProductVariant,
  size: SizeCode,
): CartLine {
  const color = product.colors.find((entry) => entry.slug === variant.colorSlug);

  return {
    variantId: variant.id,
    sku: variant.sku,
    productId: product.id,
    slug: product.slug,
    title: product.title,
    colorName: color?.name ?? variant.colorSlug,
    colorSlug: variant.colorSlug,
    size,
    unitPrice: variant.price,
    quantity: 1,
    image: color?.images[0] ?? product.colors[0].images[0],
    maxQuantity: Math.max(variant.inventory, 1),
  };
}

/**
 * Quick Add works from the summary, which carries stock for the default colour
 * only. That is enough: the button never offers a colour picker.
 */
export function lineFromSummary(
  product: ProductSummary,
  size: SizeCode,
): CartLine | null {
  const entry = product.sizeStock.find((item) => item.size === size);
  if (!entry?.variantId || !entry.inStock) return null;

  return {
    variantId: entry.variantId,
    sku: entry.variantId,
    productId: product.id,
    slug: product.slug,
    title: product.title,
    colorName: product.defaultColorName,
    colorSlug: product.defaultColorSlug,
    size,
    unitPrice: product.price,
    quantity: 1,
    image: product.images[0],
    maxQuantity: Math.max(entry.inventory, 1),
  };
}
