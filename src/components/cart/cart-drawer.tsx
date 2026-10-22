"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/lib/ui/store";
import { useCartStore } from "@/lib/cart/store";
import { useT } from "@/i18n/provider";
import { CartLineItem } from "./cart-line-item";
import { CartSummary, useCartTotals } from "./cart-summary";

export function CartDrawer() {
  const open = useUiStore((state) => state.cartOpen);
  const close = useUiStore((state) => state.closeCart);
  const lines = useCartStore((state) => state.lines);
  const { count } = useCartTotals();
  const t = useT();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      // Focus goes back to whatever opened the drawer, not to the page top.
      restoreRef.current?.focus();
    };
  }, [open, close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      inert={!open}
      className={cn("fixed inset-0 z-[80]", open ? "pointer-events-auto" : "pointer-events-none")}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close shopping bag"
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/45 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col overflow-x-hidden bg-bone transition-transform duration-400 ease-[var(--ease-editorial)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="label flex items-center gap-2 text-ink">
            <ShoppingBag className="size-3.5" strokeWidth={1.5} aria-hidden />
            {t("nav.bag")}
            <span className="tnum text-stone">({count})</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-9 items-center justify-center text-ink/70 transition-colors hover:text-ink"
          >
            <X className="size-4" strokeWidth={1.25} aria-hidden />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center px-5">
            <p className="display text-[1.6rem] text-ink">{t("cart.empty")}</p>
            <p className="mt-3 max-w-[30ch] text-[0.82rem] leading-relaxed text-stone">
              {t("cart.emptyBody")}
            </p>
            <Link
              href="/collections/women"
              onClick={close}
              className="label mt-6 border-b border-ink pb-1.5 text-ink transition-opacity hover:opacity-60"
            >
              Shop Women
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y divide-line">
                {lines.map((line) => (
                  <CartLineItem key={line.variantId} line={line} compact />
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-5">
              <CartSummary />
              <div className="mt-5 flex items-center justify-between gap-4">
                <Link
                  href="/cart"
                  onClick={close}
                  className="label border-b border-ink pb-1.5 text-ink transition-opacity hover:opacity-60"
                >
                  {t("action.viewBag")}
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="label text-stone transition-colors hover:text-ink"
                >
                  {t("action.continueShopping")}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
