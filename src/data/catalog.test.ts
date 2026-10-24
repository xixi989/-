import { describe, expect, it } from "vitest";
import { catalog, CATEGORY_LABELS, PHOTO_PENDING } from "@/data/catalog";
import { collectionList } from "@/data/collections";
import { CATEGORY_HANDLES, SIZE_CODES } from "@/types/commerce";

describe("catalogue shape", () => {
  it("ships 24–36 products, as the brief requires", () => {
    expect(catalog.length).toBeGreaterThanOrEqual(24);
    expect(catalog.length).toBeLessThanOrEqual(36);
  });

  it("has unique slugs and ids", () => {
    expect(new Set(catalog.map((entry) => entry.slug)).size).toBe(catalog.length);
    expect(new Set(catalog.map((entry) => entry.id)).size).toBe(catalog.length);
  });

  it("covers every category in the navigation", () => {
    const covered = new Set(catalog.flatMap((entry) => entry.collections));
    for (const handle of CATEGORY_HANDLES) {
      expect(covered.has(handle)).toBe(true);
    }
  });

  it("has a navigation entry for every category", () => {
    const navHandles = collectionList.map((entry) => entry.handle).sort();
    expect(navHandles).toEqual([...CATEGORY_HANDLES].sort());
  });

  it("keeps the category label map exhaustive", () => {
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual([...CATEGORY_HANDLES].sort());
  });

  it("always includes the primary category in its collections", () => {
    for (const product of catalog) {
      expect(product.collections).toContain(product.category);
    }
  });
});

describe("variants and stock", () => {
  it("generates one variant per colour × size, with unique SKUs", () => {
    const skus = new Set<string>();

    for (const product of catalog) {
      expect(product.variants).toHaveLength(product.colors.length * product.sizes.length);
      for (const variant of product.variants) {
        expect(product.sizes).toContain(variant.size);
        expect(product.colors.some((color) => color.slug === variant.colorSlug)).toBe(true);
        expect(skus.has(variant.sku)).toBe(false);
        skus.add(variant.sku);
        expect(variant.id).toBe(variant.sku);
      }
    }

    expect(skus.size).toBe(catalog.reduce((total, entry) => total + entry.variants.length, 0));
  });

  it("stores money as positive integer minor units", () => {
    for (const product of catalog) {
      expect(Number.isInteger(product.price.amount)).toBe(true);
      expect(product.price.amount).toBeGreaterThan(0);
      expect(product.price.currency).toBe("USD");

      if (product.compareAtPrice) {
        expect(Number.isInteger(product.compareAtPrice.amount)).toBe(true);
        expect(product.compareAtPrice.amount).toBeGreaterThan(product.price.amount);
      }

      for (const variant of product.variants) {
        expect(variant.price.amount).toBe(product.price.amount);
        expect(Number.isInteger(variant.inventory)).toBe(true);
        expect(variant.inventory).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("keeps every product buyable in at least one size", () => {
    for (const product of catalog) {
      const buyable = product.variants.some((variant) => variant.inventory > 0);
      expect(buyable, `${product.slug} has no stock anywhere`).toBe(true);
    }
  });

  it("includes sold-out variants so the stock UI has something to show", () => {
    const soldOut = catalog.flatMap((product) =>
      product.variants.filter((variant) => variant.inventory === 0),
    );
    expect(soldOut.length).toBeGreaterThan(10);
  });

  it("only uses sizes from the canonical run", () => {
    for (const product of catalog) {
      for (const size of product.sizes) {
        expect(SIZE_CODES).toContain(size);
      }
    }
  });
});

describe("photography and copy", () => {
  it("gives every colour at least one local image", () => {
    for (const product of catalog) {
      expect(product.colors.length).toBeGreaterThan(0);
      for (const color of product.colors) {
        expect(color.images.length).toBeGreaterThan(0);
        for (const image of color.images) {
          expect(image.src.startsWith("/images/")).toBe(true);
          expect(image.alt.length).toBeGreaterThan(8);
        }
      }
    }
  });

  it("writes real copy, not lorem ipsum", () => {
    for (const product of catalog) {
      expect(product.description.length).toBeGreaterThan(60);
      expect(product.material.length).toBeGreaterThan(4);
      expect(product.careInstructions.length).toBeGreaterThan(1);
      expect(product.fit.length).toBeGreaterThan(8);
    }
  });

  it("has a valid release date for the newest sort", () => {
    for (const product of catalog) {
      expect(Number.isNaN(Date.parse(product.releasedAt))).toBe(false);
      expect(product.releasedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("photography shows the product", () => {
  // Only categories the title names outright. A "Wool Overcoat" is not asserted
  // to show a coat close-up, but a "Bag" must actually contain a bag.
  const CATEGORY_RULES: Array<{ title: RegExp; alt: RegExp }> = [
    { title: /Bag/i, alt: /\b(bags?|tote|weekender)\b/i },
    { title: /Trouser/i, alt: /\b(trousers?|jeans?|denim)\b/i },
    { title: /Hat|Beanie/i, alt: /\b(hats?|beanie|cap)\b/i },
    { title: /Scarf/i, alt: /\bscarf\b/i },
    { title: /Boot|Derby/i, alt: /\b(boots?|shoes?|derby)\b/i },
    { title: /Dress/i, alt: /\bdress\b/i },
  ];

  it("uses a frame whose alt text names the product's category", () => {
    for (const product of catalog) {
      if (PHOTO_PENDING[product.slug]) continue;

      for (const rule of CATEGORY_RULES) {
        if (!rule.title.test(product.title)) continue;
        const alt = product.colors[0].images[0].alt;
        expect(rule.alt.test(alt), `${product.slug} primary alt: "${alt}"`).toBe(true);
      }
    }
  });

  it("never lists a product as photo-pending unless it is still a gap", () => {
    for (const [slug, reason] of Object.entries(PHOTO_PENDING)) {
      const product = catalog.find((entry) => entry.slug === slug);
      expect(product, `${slug} is in PHOTO_PENDING but not in the catalogue`).toBeDefined();
      expect(reason.length).toBeGreaterThan(10);
      // A pending product must still ship an image; the gap is semantic, not missing.
      expect(product?.colors[0].images.length).toBeGreaterThan(0);
    }
  });

  it("gives every colourway at least one frame", () => {
    for (const product of catalog) {
      for (const color of product.colors) {
        expect(color.images.length, `${product.slug}/${color.slug}`).toBeGreaterThan(0);
      }
    }
  });
});
