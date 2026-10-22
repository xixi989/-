import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import type { Product } from "@/types/commerce";
import {
  findVariant,
  firstAvailableColorSlug,
  isColorAvailable,
  isSoldOut,
  offersSize,
  sizesForColor,
  toSummary,
} from "./adapter";

const bySlug = (slug: string): Product => {
  const found = catalog.find((product) => product.slug === slug);
  if (!found) throw new Error(`missing product ${slug}`);
  return found;
};

describe("variant lookup", () => {
  it("finds the exact colour and size combination", () => {
    const product = bySlug("wool-overcoat");
    const variant = findVariant(product, "heather-moss", "M");
    expect(variant).toBeDefined();
    expect(variant?.id).toBe(variant?.sku);
  });

  it("returns undefined for a combination that is not sold", () => {
    const product = bySlug("straw-bucket-hat");
    expect(findVariant(product, "natural", "XL")).toBeUndefined();
  });

  it("never treats a product-level price as a variant price", () => {
    const product = bySlug("leather-moto-jacket");
    const variant = findVariant(product, "ink", "L");
    expect(variant?.price.amount).toBe(42000);
    expect(variant?.price.currency).toBe("USD");
  });
});

describe("stock states", () => {
  it("flags sizes that are out of stock and leaves the rest buyable", () => {
    const product = bySlug("wool-overcoat"); // L is deliberately sold out
    const sizes = sizesForColor(product, "heather-moss");

    expect(sizes.find((entry) => entry.size === "L")?.inStock).toBe(false);
    expect(sizes.find((entry) => entry.size === "L")?.inventory).toBe(0);
    expect(sizes.filter((entry) => entry.inStock).length).toBeGreaterThan(0);
  });

  it("reports low stock separately from sold out", () => {
    const product = bySlug("fluid-cotton-tee");
    const low = sizesForColor(product, "bone").filter((entry) => entry.lowStock);
    expect(low.every((entry) => entry.inventory > 0 && entry.inventory <= 2)).toBe(true);
  });

  it("only calls a colour available when some size has stock", () => {
    const product = bySlug("wool-overcoat");
    for (const color of product.colors) {
      const anyStock = product.variants.some(
        (variant) => variant.colorSlug === color.slug && variant.inventory > 0,
      );
      expect(isColorAvailable(product, color.slug)).toBe(anyStock);
    }
  });

  it("picks a default colour that can actually be bought", () => {
    for (const product of catalog) {
      const slug = firstAvailableColorSlug(product);
      const color = product.colors.find((entry) => entry.slug === slug);
      expect(color).toBeDefined();
      // Only assert availability when the product is not fully sold out.
      if (!isSoldOut(product)) {
        expect(isColorAvailable(product, slug)).toBe(true);
      }
    }
  });

  it("knows whether a size is offered at all", () => {
    expect(offersSize(bySlug("merino-scarf"), "M")).toBe(true);
    expect(offersSize(bySlug("merino-scarf"), "S")).toBe(false);
  });
});

describe("toSummary", () => {
  it("carries only the stock Quick Add needs, for the default colour", () => {
    const product = bySlug("oxford-shirt");
    const summary = toSummary(product);

    expect(summary.sizeStock).toHaveLength(product.sizes.length);
    expect(summary.defaultColorSlug).toBe(firstAvailableColorSlug(product));
    expect(summary.colors.every((color) => !("images" in color))).toBe(true);
    expect(summary.images.length).toBeGreaterThan(0);
  });

  it("marks a product sold out only when every variant is gone", () => {
    const product = bySlug("ribbed-wool-beanie");
    const expected = product.variants.every((variant) => variant.inventory <= 0);
    expect(toSummary(product).soldOut).toBe(expected);
  });
});
