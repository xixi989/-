import type { Product } from "@/types/commerce";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  type Crumb,
} from "@/lib/seo/product-json-ld";

/**
 * Thin renderers. All the data shaping lives in `lib/seo/product-json-ld`, which
 * is why the offers, SKUs and availability in the markup can be unit tested.
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `</script>` inside a string would close the tag early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function ProductJsonLd({ product }: { product: Product }) {
  return <JsonLd data={buildProductJsonLd(product)} />;
}

export type { Crumb };

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return <JsonLd data={buildBreadcrumbJsonLd(items)} />;
}
