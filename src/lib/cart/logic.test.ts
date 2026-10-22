import { describe, expect, it } from "vitest";
import type { CartLine } from "@/types/commerce";
import {
  addLineToCart,
  cartCount,
  cartSubtotal,
  removeLineFromCart,
  setLineQuantity,
  FREE_SHIPPING_THRESHOLD,
} from "./logic";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    variantId: "AUR-KNT01-bone-M",
    sku: "AUR-KNT01-bone-M",
    productId: "aur-001",
    slug: "wool-cashmere-cardigan",
    title: "Wool-Cashmere Cardigan",
    colorName: "Bone",
    colorSlug: "bone",
    size: "M",
    unitPrice: { amount: 18500, currency: "USD" },
    quantity: 1,
    image: { src: "/images/x.jpg", alt: "cardigan" },
    maxQuantity: 4,
    ...overrides,
  };
}

describe("addLineToCart", () => {
  it("adds a new variant", () => {
    const result = addLineToCart([], line());
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1);
  });

  it("merges the same variant instead of duplicating the row", () => {
    const once = addLineToCart([], line());
    const twice = addLineToCart(once, line());
    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(2);
  });

  it("keeps different sizes of the same product as separate lines", () => {
    const sized = addLineToCart(addLineToCart([], line()), line({ variantId: "AUR-KNT01-bone-L", size: "L" }));
    expect(sized).toHaveLength(2);
  });

  it("clamps merged quantity to available stock", () => {
    const start = addLineToCart([], line({ quantity: 3 }));
    const merged = addLineToCart(start, line({ quantity: 3 }));
    expect(merged[0].quantity).toBe(4); // maxQuantity
  });

  it("clamps the first add too", () => {
    const result = addLineToCart([], line({ quantity: 9, maxQuantity: 2 }));
    expect(result[0].quantity).toBe(2);
  });

  it("ignores an add with no stock", () => {
    expect(addLineToCart([], line({ maxQuantity: 0 }))).toHaveLength(0);
  });

  it("does not mutate the previous state", () => {
    const start = addLineToCart([], line());
    const next = addLineToCart(start, line());
    expect(start[0].quantity).toBe(1);
    expect(next[0].quantity).toBe(2);
  });
});

describe("quantity and removal", () => {
  it("removes a line when quantity drops to zero", () => {
    const start = addLineToCart([], line());
    expect(setLineQuantity(start, start[0].variantId, 0)).toHaveLength(0);
    expect(setLineQuantity(start, start[0].variantId, -3)).toHaveLength(0);
  });

  it("clamps a manual quantity to stock", () => {
    const start = addLineToCart([], line());
    expect(setLineQuantity(start, start[0].variantId, 99)[0].quantity).toBe(4);
  });

  it("removes by variant id", () => {
    const start = addLineToCart(addLineToCart([], line()), line({ variantId: "b", size: "L" }));
    const after = removeLineFromCart(start, "b");
    expect(after).toHaveLength(1);
    expect(after[0].variantId).toBe("AUR-KNT01-bone-M");
  });
});

describe("totals", () => {
  it("computes the subtotal in integer minor units", () => {
    const lines = [
      line({ quantity: 2 }), // 18500 * 2
      line({ variantId: "x", unitPrice: { amount: 4500, currency: "USD" }, quantity: 3 }),
    ];
    expect(cartSubtotal(lines)).toBe(37000 + 13500);
    expect(Number.isInteger(cartSubtotal(lines))).toBe(true);
  });

  it("counts units, not rows", () => {
    expect(cartCount([line({ quantity: 2 }), line({ variantId: "x", quantity: 3 })])).toBe(5);
  });

  it("has a free shipping threshold in minor units", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(15000);
  });
});
