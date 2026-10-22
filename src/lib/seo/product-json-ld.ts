import { CATEGORY_LABELS } from "@/data/catalog";
import { absoluteUrl, site } from "@/lib/site-config";
import type { Product } from "@/types/commerce";

/**
 * Builders only — no JSX — so the JSON-LD can be unit tested against the same
 * catalogue the pages render.
 *
 * Deliberately absent: aggregateRating, review, reviewCount, gtin, shippingDetails,
 * returnPolicy, priceValidUntil. None of them exist in this project, and a rich
 * result built on invented data is worse than no rich result.
 *
 * priceCurrency is always the variant's own currency (USD). A converted EUR price
 * is a reference figure this shop cannot settle, so it must never be published as
 * a purchasable offer.
 */

export type JsonLdObject = Record<string, unknown>;

export interface Crumb {
  name: string;
  path: string;
}

export function buildProductJsonLd(product: Product): JsonLdObject {
  const url = absoluteUrl(`/products/${product.slug}`);
  const images = [
    ...new Set(product.colors.flatMap((color) => color.images.map((image) => image.src))),
  ]
    .map((src) => absoluteUrl(src))
    .filter((src): src is string => Boolean(src));

  const colorName = (slug: string) =>
    product.colors.find((color) => color.slug === slug)?.name ?? slug;

  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.id,
    category: CATEGORY_LABELS[product.category],
    brand: { "@type": "Brand", name: site.name },
    material: product.material,
    color: product.colors.map((color) => color.name).join(", "),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.id,
      name: `${product.title} — ${colorName(variant.colorSlug)} / ${variant.size}`,
      price: (variant.price.amount / 100).toFixed(2),
      priceCurrency: variant.price.currency,
      availability:
        variant.inventory > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(url ? { url } : {}),
    })),
  };

  if (images.length > 0) data.image = images;
  if (url) data.url = url;

  return data;
}

export function buildBreadcrumbJsonLd(items: Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const url = absoluteUrl(item.path);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(url ? { item: url } : {}),
      };
    }),
  };
}
