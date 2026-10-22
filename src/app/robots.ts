import type { MetadataRoute } from "next";
import { indexingEnabled, siteUrl } from "@/lib/site-config";

/**
 * Indexing is opt-in, and this project is a portfolio demo — so by default the
 * whole site is closed to crawlers. Set SEO_INDEXING=true (with SITE_URL on a
 * real domain) to open it.
 *
 * Cart, wishlist and search are intentionally *not* disallowed here. They carry
 * a `noindex` robots meta tag, and a crawler has to be allowed in to read it;
 * Disallow would hide the page without ever removing it from an index.
 * Filtered collection views are handled with a canonical back to the clean URL.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled || !siteUrl) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl,
  };
}
