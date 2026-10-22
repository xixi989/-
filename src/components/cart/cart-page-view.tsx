"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { useT } from "@/i18n/provider";
import { CartLineItem } from "./cart-line-item";
import { CartSummary, useCartTotals } from "./cart-summary";

export function CartPageView() {
  const lines = useCartStore((state) => state.lines);
  const { count } = useCartTotals();
  const t = useT();

  if (lines.length === 0) {
    return (
      <div className="max-w-[52ch] py-10 md:py-16">
        <h1 className="display text-[clamp(2rem,4.5vw,3.25rem)] text-ink">{t("cart.title")}</h1>
        <p className="mt-6 text-[0.9rem] leading-relaxed text-stone">
          {t("cart.emptyBody")}
        </p>
        <Link
          href="/collections/women"
          className="label group mt-8 inline-flex items-center gap-2 border-b border-ink pb-1.5 text-ink transition-opacity hover:opacity-60"
        >
          {t("wishlist.browse")}
          <ArrowRight
            className="size-3.5 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1"
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="max-w-[52ch]">
        <h1 className="display text-[clamp(2rem,4.5vw,3.25rem)] text-ink">{t("cart.title")}</h1>
        <p className="label mt-4 text-stone">
          {t(count === 1 ? "cart.item" : "cart.items", { n: count })}
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <ul className="divide-y divide-line border-t border-line">
          {lines.map((line) => (
            <CartLineItem key={line.variantId} line={line} />
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="label text-mist">{t("cart.orderSummary")}</h2>
          <div className="mt-5">
            <CartSummary />
          </div>
          <Link
            href="/collections/women"
            className="label mt-6 inline-flex items-center gap-2 text-stone transition-colors hover:text-ink"
          >
            {t("action.continueShopping")}
            <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
          </Link>
        </aside>
      </div>
    </div>
  );
}
