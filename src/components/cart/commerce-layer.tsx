"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";
import { getVariantIndex, reconcileLines } from "@/lib/cart/validate";
import { CartDrawer } from "./cart-drawer";
import { SearchDialog } from "@/components/search/search-dialog";

/**
 * Mounted once by the root layout. Two jobs:
 * 1. render the global overlays,
 * 2. heal a cart restored from localStorage against the current catalogue —
 *    after hydration, never during render, so SSR markup stays identical.
 */
export function CommerceLayer() {
  useEffect(() => {
    const reconcile = () => {
      const state = useCartStore.getState();
      const result = reconcileLines(state.lines, getVariantIndex());
      if (result.removed.length > 0 || result.adjusted.length > 0) {
        state.replaceLines(result.lines);
      }
    };

    if (useCartStore.persist.hasHydrated()) {
      reconcile();
      return;
    }

    return useCartStore.persist.onFinishHydration(reconcile);
  }, []);

  return (
    <>
      <CartDrawer />
      <SearchDialog />
    </>
  );
}
