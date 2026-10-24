"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { catalog } from "@/data/catalog";
import { toSummary } from "@/lib/commerce/adapter";
import { useWishlistStore } from "@/lib/wishlist/store";
import { useT } from "@/i18n/provider";

/** Stable identity: returning a new [] here triggers React's infinite-loop guard. */
const EMPTY_SLUGS: readonly string[] = [];

export function WishlistView() {
  const t = useT();
  const slugs = useSyncExternalStore(
    useWishlistStore.subscribe,
    () => useWishlistStore.getState().slugs,
    () => EMPTY_SLUGS as string[],
  );

  // Saved slugs are resolved against the catalogue every render: a slug that no
  // longer exists simply drops out instead of rendering a broken card.
  const products = useMemo(() => {
    const bySlug = new Map(catalog.map((product) => [product.slug, product]));
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((product): product is (typeof catalog)[number] => Boolean(product))
      .map(toSummary);
  }, [slugs]);

  if (products.length === 0) {
    return (
      <div className="max-w-[52ch] py-10 md:py-16">
        <h1 className="display text-[clamp(2rem,4.5vw,3.25rem)] text-ink">{t("wishlist.title")}</h1>
        {/* The empty state leads with its own line, then explains what to do. */}
        <p className="display mt-6 text-[1.15rem] text-ink">{t("wishlist.empty")}</p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-stone">
          {t("wishlist.emptyBody")}
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
        <h1 className="display text-[clamp(2rem,4.5vw,3.25rem)] text-ink">{t("wishlist.title")}</h1>
        <p className="label mt-4 text-stone">
          {t(products.length === 1 ? "wishlist.savedOne" : "wishlist.saved", { n: products.length })}
        </p>
        <p className="mt-4 text-[0.85rem] leading-relaxed text-stone">
          {t("wishlist.hint")}
        </p>
      </header>

      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
