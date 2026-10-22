"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { catalog } from "@/data/catalog";
import { CATEGORY_LABELS } from "@/data/catalog";
import { SEARCH_SUGGESTIONS, searchProducts } from "@/lib/commerce/search";
import { formatMoney } from "@/lib/format";
import { useUiStore } from "@/lib/ui/store";
import { useT } from "@/i18n/provider";

export function SearchDialog() {
  const open = useUiStore((state) => state.searchOpen);
  const close = useUiStore((state) => state.closeSearch);
  const router = useRouter();
  const t = useT();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const matches = useMemo(() => searchProducts(catalog, deferredQuery), [deferredQuery]);
  const preview = matches.slice(0, 5);
  const trimmed = query.trim();

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.focus();
    };
  }, [open, close]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    close();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      inert={!open}
      className={cn("fixed inset-0 z-[80]", open ? "pointer-events-auto" : "pointer-events-none")}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label={t("action.close")}
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/45 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "absolute inset-x-0 top-0 flex max-h-[85svh] flex-col overflow-hidden border-b border-line bg-bone transition-transform duration-400 ease-[var(--ease-editorial)]",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <form onSubmit={submit} role="search" className="mx-auto w-full max-w-[1560px] px-6 py-6 md:px-10 lg:px-14">
          <div className="flex items-center gap-4 border-b border-line pb-4">
            <Search className="size-4 shrink-0 text-stone" strokeWidth={1.5} aria-hidden />
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search.placeholder")}
              autoComplete="off"
              className="w-full bg-transparent text-[1rem] text-ink placeholder:text-mist focus:outline-none md:text-[1.15rem]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="label shrink-0 text-stone transition-colors hover:text-ink"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={close}
              aria-label={t("action.close")}
              className="-mr-1 flex size-9 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </form>

        <div className="mx-auto w-full max-w-[1560px] overflow-y-auto px-6 pb-8 md:px-10 lg:px-14">
          {deferredQuery.trim() === "" ? (
            <div>
              <p className="label text-mist">{t("search.try")}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => setQuery(suggestion)}
                      className="label border border-line px-3 py-2 text-stone transition-colors hover:border-ink hover:text-ink"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : preview.length === 0 ? (
            <div>
              <p className="text-[0.9rem] text-ink">{t("search.noResults", { q: trimmed })}</p>
              <p className="mt-2 max-w-[46ch] text-[0.8rem] leading-relaxed text-stone">
                {t("search.noResultsBody")}
              </p>
            </div>
          ) : (
            <div>
              <p className="label text-mist">
                {t(matches.length === 1 ? "search.resultOne" : "search.results", { n: matches.length })}
              </p>
              <ul className="mt-4 divide-y divide-line">
                {preview.map((product) => {
                  const image = product.colors[0].images[0];
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={close}
                        className="group flex items-center gap-4 py-3"
                      >
                        <span className="relative block aspect-3/4 w-12 shrink-0 overflow-hidden bg-sand">
                          <Image
                            src={image.src}
                            alt=""
                            fill
                            sizes="48px"
                            className="photo object-cover"
                            style={{ objectPosition: image.objectPosition ?? "50% 50%" }}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.88rem] text-ink group-hover:underline group-hover:underline-offset-4">
                            {product.title}
                          </span>
                          <span className="label mt-1 block text-[0.6rem] text-mist">
                            {CATEGORY_LABELS[product.category]}
                          </span>
                        </span>
                        <span className="tnum shrink-0 text-[0.85rem] text-ink">
                          {formatMoney(product.price)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(trimmed)}`);
                  close();
                }}
                className="label mt-6 inline-flex items-center gap-2 border-b border-ink/30 pb-1.5 text-ink transition-colors hover:border-ink"
              >
                {t("search.viewAll", { n: matches.length })}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
