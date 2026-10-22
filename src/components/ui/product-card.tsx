"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Eye, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrice } from "@/lib/preferences/use-price";
import { useT } from "@/i18n/provider";
import { useCartStore } from "@/lib/cart/store";
import { lineFromSummary } from "@/lib/cart/lines";
import type { ProductSummary, SizeCode } from "@/types/commerce";
import { useUiStore } from "@/lib/ui/store";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { QuickView } from "./quick-view";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary;
  priority?: boolean;
}) {
  const [primary, secondary] = product.images;
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<SizeCode | null>(null);
  const addLine = useCartStore((state) => state.addLine);
  const openCart = useUiStore((state) => state.openCart);
  const price = usePrice();
  const t = useT();

  useEffect(() => {
    if (!sizePickerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSizePickerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sizePickerOpen]);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(null), 2200);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  function handleQuickAdd(size: SizeCode) {
    const line = lineFromSummary(product, size);
    if (!line) return;
    addLine(line);
    setJustAdded(size);
    setSizePickerOpen(false);
    openCart();
  }

  return (
    <article className="group relative">
      <div className="relative aspect-3/4 overflow-hidden bg-sand">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block"
          aria-label={`${product.title}, ${price(product.price)}`}
        >
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 23vw, (min-width: 768px) 30vw, 46vw"
            className="photo object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
            style={{ objectPosition: primary.objectPosition ?? "50% 50%" }}
          />
          {secondary ? (
            <Image
              src={secondary.src}
              alt={secondary.alt}
              fill
              sizes="(min-width: 1280px) 23vw, (min-width: 768px) 30vw, 46vw"
              className="photo object-cover opacity-0 transition-opacity duration-500 ease-[var(--ease-editorial)] group-hover:opacity-100 group-focus-within:opacity-100"
              style={{ objectPosition: secondary.objectPosition ?? "50% 50%" }}
            />
          ) : null}
        </Link>

        <div className="absolute top-2 right-2 z-20">
          <WishlistButton slug={product.slug} title={product.title} />
        </div>

        {product.soldOut ? (
          <p className="label absolute inset-x-0 top-4 z-10 text-center text-ink/70">{t("pdp.soldOut")}</p>
        ) : null}

        {/* Actions sit above the link layer so the whole image stays one target. */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex items-stretch gap-1.5">
          {sizePickerOpen ? (
            <div className="pointer-events-auto w-full bg-bone/97 p-2">
              <p className="label mb-2 px-1 text-[0.6rem] text-stone">
                {product.defaultColorName} — {t("pdp.selectSize")}
              </p>
              <ul className="flex flex-wrap gap-1">
                {product.sizeStock.map((entry) => (
                  <li key={entry.size}>
                    <button
                      type="button"
                      disabled={!entry.inStock}
                      onClick={() => handleQuickAdd(entry.size)}
                      className={cn(
                        "label min-w-9 px-2 py-2 text-[0.6rem] transition-colors",
                        entry.inStock
                          ? "text-ink hover:bg-ink hover:text-bone"
                          : "cursor-not-allowed text-mist line-through",
                      )}
                    >
                      {entry.size}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={product.soldOut}
                onClick={() => setSizePickerOpen(true)}
                className={cn(
                  "label pointer-events-auto flex flex-1 items-center justify-center gap-1.5 bg-bone/95 py-2.5 text-[0.6rem] text-ink transition-all duration-300 hover:bg-ink hover:text-bone",
                  "translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100",
                  product.soldOut && "cursor-not-allowed opacity-50",
                )}
              >
                {justAdded ? (
                  <Check className="size-3" aria-hidden />
                ) : (
                  <Plus className="size-3" aria-hidden />
                )}
                {justAdded ? `${t("action.added")} ${justAdded}` : t("action.quickAdd")}
              </button>

              <button
                type="button"
                onClick={() => setQuickViewOpen(true)}
                aria-label={`Quick view: ${product.title}`}
                className="pointer-events-auto flex items-center justify-center bg-bone/95 px-3 text-ink transition-all duration-300 hover:bg-ink hover:text-bone md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
              >
                <Eye className="size-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {justAdded ? `${product.title} in size ${justAdded} added to your bag` : ""}
      </p>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="min-w-0">
          <h3 className="text-[0.925rem] leading-snug text-ink">
            <Link
              href={`/products/${product.slug}`}
              className="hover:underline hover:decoration-1 hover:underline-offset-4"
            >
              {product.title}
            </Link>
          </h3>
          <p className="label mt-2 text-[0.65rem] text-stone">{product.categoryLabel}</p>

          <ul className="mt-3 flex items-center gap-1.5" aria-hidden>
            {product.colors.map((color) => (
              <li
                key={color.slug}
                className="size-[9px] rounded-full ring-1 ring-ink/15"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </ul>
          <p className="sr-only">
            Available in {product.colors.map((color) => color.name).join(", ")}.
          </p>
        </div>

        <p className="tnum shrink-0 text-[0.925rem] text-ink md:text-right">
          {price(product.price)}
          {product.compareAtPrice ? (
            <span className="mt-0.5 block text-[0.75rem] text-mist line-through">
              {price(product.compareAtPrice)}
            </span>
          ) : null}
        </p>
      </div>

      {quickViewOpen ? (
        <QuickView product={product} onClose={() => setQuickViewOpen(false)} />
      ) : null}
    </article>
  );
}
