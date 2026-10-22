"use client";

import { useFormatUsdCents } from "@/lib/preferences/use-price";
import { useT } from "@/i18n/provider";
import { FREE_SHIPPING_THRESHOLD, useCartStore } from "@/lib/cart/store";
import { getVariantIndex } from "@/lib/cart/validate";

/**
 * Totals are recomputed from the catalogue, not from the price snapshot in
 * storage: if a price changes, the bag reflects it immediately, and lines that
 * no longer exist contribute nothing.
 */
export function useCartTotals() {
  const lines = useCartStore((state) => state.lines);
  const index = getVariantIndex();

  let subtotal = 0;
  let count = 0;

  for (const line of lines) {
    const snapshot = index.get(line.variantId);
    if (!snapshot || snapshot.inventory <= 0) continue;
    const quantity = Math.min(line.quantity, snapshot.inventory);
    subtotal += snapshot.price.amount * quantity;
    count += quantity;
  }

  return {
    subtotal,
    count,
    currency: "USD" as const,
    remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    freeShippingProgress: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
  };
}

export function CartSummary({ showCheckout = true }: { showCheckout?: boolean }) {
  const { subtotal, remainingForFreeShipping, freeShippingProgress } = useCartTotals();
  const format = useFormatUsdCents();
  const t = useT();

  return (
    <div>
      <dl className="space-y-3 border-t border-line pt-5">
        <div className="flex items-baseline justify-between">
          <dt className="text-[0.8rem] text-stone">{t("cart.subtotal")}</dt>
          <dd className="tnum text-[0.95rem] text-ink">{format(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-[0.8rem] text-stone">{t("cart.shipping")}</dt>
          <dd className="text-[0.8rem] text-stone">
            {remainingForFreeShipping === 0 ? t("cart.complimentary") : t("cart.calculatedAtCheckout")}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="h-px w-full bg-line">
          <div
            className="h-px bg-ink transition-[width] duration-500 ease-[var(--ease-editorial)]"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
        <p className="mt-3 text-[0.72rem] leading-relaxed text-stone">
          {remainingForFreeShipping === 0
            ? t("cart.freeShippingApplied")
            : t("cart.freeShippingRemaining", { amount: format(remainingForFreeShipping) })}
        </p>
      </div>

      {showCheckout ? (
        <div className="mt-6">
          <button
            type="button"
            disabled
            aria-describedby="checkout-note"
            className="label w-full cursor-not-allowed bg-sand py-4 text-mist"
          >
            {t("cart.checkout")}
          </button>
          <p id="checkout-note" className="mt-3 text-[0.7rem] leading-relaxed text-stone">
            {t("cart.checkoutNote")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
