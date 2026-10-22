import { catalog } from "@/data/catalog";
import type { CategoryHandle, Product } from "@/types/commerce";
import type { CommerceAdapter } from "./adapter";

/**
 * Local adapter. Async on purpose: the call sites are written for a network
 * boundary, so moving to Storefront API later does not change a single caller.
 */
export class MockCommerceAdapter implements CommerceAdapter {
  async listProducts(collection?: CategoryHandle): Promise<Product[]> {
    if (!collection) return [...catalog];
    return catalog.filter((product) => product.collections.includes(collection));
  }

  async getProduct(slug: string): Promise<Product | null> {
    return catalog.find((product) => product.slug === slug) ?? null;
  }

  async getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
    const source = catalog.find((product) => product.slug === slug);
    if (!source) return [];

    // Same category first, then anything sharing a collection, never itself.
    const scored = catalog
      .filter((product) => product.slug !== slug)
      .map((product) => {
        const sharedCollections = product.collections.filter((collection) =>
          source.collections.includes(collection),
        ).length;
        const sameCategory = product.category === source.category ? 2 : 0;
        const sharedTags = product.tags.filter((tag) => source.tags.includes(tag)).length;
        return { product, score: sameCategory + sharedCollections * 2 + sharedTags };
      })
      .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title));

    return scored.slice(0, limit).map((entry) => entry.product);
  }

  async getNewArrivals(limit = 4): Promise<Product[]> {
    return [...catalog]
      .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
      .slice(0, limit);
  }
}

export const commerce: CommerceAdapter = new MockCommerceAdapter();
