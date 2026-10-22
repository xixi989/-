"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types/commerce";
import { addLineToCart, removeLineFromCart, setLineQuantity } from "./logic";

/**
 * Cart state for phase 2. The drawer UI lands in phase 4 — what matters now is
 * that a line is built from a real variant (id, SKU, colour, size, price
 * snapshot), so nothing can be added "by product name" and totals stay exact.
 */
interface CartState {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  /** Used by the reconciler after a restored cart is checked against the catalogue. */
  replaceLines: (lines: CartLine[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (line) => set((state) => ({ lines: addLineToCart(state.lines, line) })),
      removeLine: (variantId) =>
        set((state) => ({ lines: removeLineFromCart(state.lines, variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({ lines: setLineQuantity(state.lines, variantId, quantity) })),
      replaceLines: (lines) => set({ lines }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "aurel-cart",
      version: 1,
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export { cartCount, cartSubtotal, FREE_SHIPPING_THRESHOLD } from "./logic";
