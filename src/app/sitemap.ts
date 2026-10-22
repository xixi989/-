import type { MetadataRoute } from "next";
import { catalog } from "@/data/catalog";
import { collectionList } from "@/data/collections";
import { siteUrl } from "@/lib/site-config";

/**
 * Only indexable, parameter-free URLs. Cart, wishlist and search are excluded
 * (they are shopper state), and so is every filtered or sorted collection view —
 * those would be thousands of near-duplicates.
 *
 * No `lastModified` is emitted: the catalogue has a `releasedAt` date, which is
 * a release date, not a modification date. Inventing "updated today" for every
 * product is exactly the kind of signal crawlers learn to ignore.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl;
  if (!origin) return [];

  const url = (path: string) => new URL(path, origin).toString();

  return [
    {
      url: url("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...collectionList.map((collection) => ({
      url: url(`/collections/${collection.handle}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...catalog.map((product) => ({
      url: url(`/products/${product.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
