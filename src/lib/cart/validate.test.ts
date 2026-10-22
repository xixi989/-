import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import type { CartLine } from "@/types/commerce";
import {
  buildVariantIndex,
  lineStatus,
  reconcileLines,
  type VariantSnapshot,
} from "./validate";

const index = buildVariantIndex(catalog);
const snapshots = [...index.values()];
const inStock = snapshots.find((entry) => entry.inventory >= 3) as VariantSnapshot;
const soldOut = snapshots.find((entry) => entry.inventory === 0) as VariantSnapshot;

function lineFrom(snapshot: VariantSnapshot, overrides: Partial<CartLine> = {}): CartLine {
  return {
    variantId: snapshot.variantId,
    sku: snapshot.variantId,
    productId: snapshot.productId,
    slug: snapshot.slug,
    title: snapshot.title,
    colorName: snapshot.colorName,
    colorSlug: snapshot.colorSlug,
    size: snapshot.size,
    unitPrice: snapshot.price,
    quantity: 1,
    image: snapshot.image,
    maxQuantity: snapshot.inventory,
    ...overrides,
  };
}

describe("buildVariantIndex", () => {
  it("indexes every SKU in the catalogue by variant id", () => {
    const expected = catalog.reduce((total, product) => total + product.variants.length, 0);
    expect(index.size).toBe(expected);
  });

  it("carries the data a cart line needs", () => {
    expect(inStock.variantId).toBeTruthy();
    expect(inStock.price.currency).toBe("USD");
    expect(inStock.image.src.startsWith("/images/")).toBe(true);
    expect(inStock.colorName.length).toBeGreaterThan(2);
  });
});

describe("reconcileLines", () => {
  it("keeps a healthy line untouched", () => {
    const result = reconcileLines([lineFrom(inStock)], index);
    expect(result.lines).toHaveLength(1);
    expect(result.removed).toHaveLength(0);
    expect(result.adjusted).toHaveLength(0);
  });

  it("drops a SKU that no longer exists", () => {
    const ghost = lineFrom(inStock, { variantId: "AUR-GONE-bone-M" });
    const result = reconcileLines([ghost], index);
    expect(result.lines).toHaveLength(0);
    expect(result.removed[0]).toMatchObject({ variantId: "AUR-GONE-bone-M", reason: "missing" });
  });

  it("drops a SKU that has since sold out", () => {
    const result = reconcileLines([lineFrom(soldOut)], index);
    expect(result.lines).toHaveLength(0);
    expect(result.removed[0].reason).toBe("sold-out");
  });

  it("clamps a quantity above current stock", () => {
    const result = reconcileLines([lineFrom(inStock, { quantity: 99 })], index);
    expect(result.lines[0].quantity).toBe(inStock.inventory);
    expect(result.adjusted[0]).toMatchObject({ reason: "stock", to: inStock.inventory });
  });

  it("refreshes a stale price from the catalogue", () => {
    const stale = lineFrom(inStock, { unitPrice: { amount: 100, currency: "USD" } });
    const result = reconcileLines([stale], index);
    expect(result.lines[0].unitPrice.amount).toBe(inStock.price.amount);
    expect(result.adjusted[0].reason).toBe("price");
  });

  it("repairs presentation fields from the catalogue", () => {
    const stale = lineFrom(inStock, { title: "Old name", colorName: "Mistake" });
    const result = reconcileLines([stale], index);
    expect(result.lines[0].title).toBe(inStock.title);
    expect(result.lines[0].colorName).toBe(inStock.colorName);
  });

  it("handles a mixed bag without dropping the good lines", () => {
    const result = reconcileLines(
      [
        lineFrom(inStock),
        lineFrom(inStock, { variantId: "AUR-GONE-bone-M" }),
        lineFrom(soldOut),
      ],
      index,
    );
    expect(result.lines).toHaveLength(1);
    expect(result.removed).toHaveLength(2);
  });

  it("is safe on an empty cart", () => {
    expect(reconcileLines([], index)).toEqual({ lines: [], removed: [], adjusted: [] });
  });
});

describe("lineStatus", () => {
  it("reports ok for a healthy line", () => {
    expect(lineStatus(lineFrom(inStock), index).kind).toBe("ok");
  });

  it("reports missing for an unknown SKU", () => {
    expect(lineStatus(lineFrom(inStock, { variantId: "nope" }), index).kind).toBe("missing");
  });

  it("reports sold-out", () => {
    expect(lineStatus(lineFrom(soldOut), index).kind).toBe("sold-out");
  });

  it("reports over-stock with the ceiling attached", () => {
    const status = lineStatus(lineFrom(inStock, { quantity: inStock.inventory + 5 }), index);
    expect(status.kind).toBe("over-stock");
    if (status.kind === "over-stock") expect(status.maxQuantity).toBe(inStock.inventory);
  });
});
