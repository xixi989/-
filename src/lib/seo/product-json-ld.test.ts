import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "./product-json-ld";

const bySlug = (slug: string) => {
  const found = catalog.find((product) => product.slug === slug);
  if (!found) throw new Error(`missing ${slug}`);
  return found;
};

const offersOf = (data: Record<string, unknown>) =>
  data.offers as Array<Record<string, string>>;

describe("buildProductJsonLd", () => {
  it("describes the product with real catalogue fields", () => {
    const product = bySlug("wool-overcoat");
    const data = buildProductJsonLd(product);

    expect(data["@type"]).toBe("Product");
    expect(data.name).toBe(product.title);
    expect(data.description).toBe(product.description);
    expect(data.sku).toBe(product.id);
    expect(data.material).toBe(product.material);
    expect(data.color).toContain("Heather Moss");
    expect(data.brand).toEqual({ "@type": "Brand", name: "AUREL STUDIO" });
  });

  it("emits one offer per real variant, each with its own SKU", () => {
    const product = bySlug("leather-moto-jacket");
    const offers = offersOf(buildProductJsonLd(product));

    expect(offers).toHaveLength(product.variants.length);
    const skus = offers.map((offer) => offer.sku);
    expect(new Set(skus).size).toBe(product.variants.length);
    for (const variant of product.variants) {
      expect(skus).toContain(variant.id);
    }
  });

  it("prices in the base currency only, never a converted one", () => {
    const product = bySlug("fluid-cotton-tee");
    const offers = offersOf(buildProductJsonLd(product));

    for (const offer of offers) {
      expect(offer.priceCurrency).toBe("USD");
      expect(offer.price).toBe("72.00");
    }
  });

  it("matches availability to actual inventory", () => {
    const product = bySlug("wool-overcoat"); // size L is sold out on purpose
    const offers = offersOf(buildProductJsonLd(product));

    for (const variant of product.variants) {
      const offer = offers.find((entry) => entry.sku === variant.id);
      expect(offer).toBeDefined();
      expect(offer?.availability).toBe(
        variant.inventory > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      );
    }

    const soldOut = offers.filter((offer) => offer.availability.endsWith("OutOfStock"));
    expect(soldOut.length).toBeGreaterThan(0);
  });

  it("never invents ratings, reviews or shipping terms", () => {
    for (const product of catalog) {
      const json = JSON.stringify(buildProductJsonLd(product));
      for (const forbidden of [
        "aggregateRating",
        "reviewCount",
        "review",
        "gtin",
        "shippingDetails",
        "priceValidUntil",
      ]) {
        expect(json).not.toContain(forbidden);
      }
    }
  });

  it("omits absolute URLs when no site origin is configured", () => {
    const data = buildProductJsonLd(bySlug("merino-scarf"));
    // vitest runs without SITE_URL, so nothing points at localhost or a fake domain.
    expect(data.url).toBeUndefined();
    expect(data.image).toBeUndefined();
    expect(offersOf(data).every((offer) => offer.url === undefined)).toBe(true);
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers the trail in order", () => {
    const data = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Women's Clothing", path: "/collections/women" },
      { name: "Wool Overcoat", path: "/products/wool-overcoat" },
    ]);

    expect(data["@type"]).toBe("BreadcrumbList");
    const items = data.itemListElement as Array<Record<string, unknown>>;
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(items.map((item) => item.name)).toEqual(["Home", "Women's Clothing", "Wool Overcoat"]);
  });
});
