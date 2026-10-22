"use client";

import { useSyncExternalStore } from "react";
import { ShoppingBag } from "lucide-react";
import { cartCount, useCartStore } from "@/lib/cart/store";
import { useUiStore } from "@/lib/ui/store";

/**
 * Persisted carts rehydrate on the client, so the count cannot be read during
 * SSR without a mismatch. `useSyncExternalStore` gives React a server snapshot
 * of 0 and the real one after hydration — no effect, no cascading render.
 */
export function CartButton() {
  const openCart = useUiStore((state) => state.openCart);
  const count = useSyncExternalStore(
    useCartStore.subscribe,
    () => cartCount(useCartStore.getState().lines),
    () => 0,
  );

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      className="flex h-10 items-center gap-2 pl-2 text-ink/80 transition-colors hover:text-ink"
    >
      <ShoppingBag className="size-[18px]" strokeWidth={1.25} aria-hidden />
      <span className="label tnum text-[0.65rem] text-ink/60">{count}</span>
    </button>
  );
}
