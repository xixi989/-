/**
 * One place for the deployment's identity. Nothing here invents a production
 * domain: without SITE_URL the build emits no canonical and no og:url, and
 * robots.txt keeps crawlers out.
 */

function readUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.origin;
  } catch {
    return null;
  }
}

/** Absolute origin used for canonical, OG and sitemap URLs. */
export const siteUrl = readUrl(process.env.SITE_URL);

/**
 * This is a portfolio demo, not a live shop, so indexing is opt-in. Set
 * SEO_INDEXING=true only on a deployment that should appear in search results.
 */
export const indexingEnabled = process.env.SEO_INDEXING === "true" && siteUrl !== null;

/** Absolute URL for a path, or undefined when no domain is configured. */
export function absoluteUrl(path: string): string | undefined {
  if (!siteUrl) return undefined;
  return new URL(path, siteUrl).toString();
}

/**
 * Canonical links resolve against metadataBase, which only exists when SITE_URL
 * is set — returning undefined keeps `localhost` out of any deployed page.
 */
export function canonicalFor(path: string): { canonical: string } | undefined {
  return siteUrl ? { canonical: path } : undefined;
}

export const site = {
  name: "AUREL STUDIO",
  legalName: "Aurel Studio",
  tagline: "Designed for the way you live.",
  description:
    "A modern essentials studio for women and men. Natural fibres, quiet tailoring and small, deliberate runs — contemporary clothing made to be worn for years.",
  twitterCard: "summary_large_image" as const,
  /** Used when SITE_URL is configured; the drawer/OG fall back to product photos. */
  defaultOgImage: "/images/hero-women.jpg",
  foundingYear: 2026,
  currency: "USD",
} as const;
