"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { withPreservedQuery } from "@/lib/commerce/url";
import {
  PRICE_BANDS,
  SORT_OPTIONS,
  buildQuery,
  isFiltering,
  type ColorFacet,
  type ProductFilters,
  type SortKey,
} from "@/lib/commerce/filters";
import type { SizeCode } from "@/types/commerce";
import { FilterPanel } from "./filter-panel";

interface ToolbarProps {
  filters: ProductFilters;
  sort: SortKey;
  count: number;
  colors: ColorFacet[];
  sizes: SizeCode[];
}

export function CollectionToolbar({ filters, sort, count, colors, sizes }: ToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  function setSort(next: SortKey) {
    const query = buildQuery(filters, next);
    startTransition(() => {
      router.replace(withPreservedQuery(pathname, query), { scroll: false });
    });
  }

  function removeFilter(kind: "color" | "size" | "price", value: string) {
    const next: ProductFilters = {
      colors: kind === "color" ? filters.colors.filter((entry) => entry !== value) : filters.colors,
      sizes:
        kind === "size"
          ? filters.sizes.filter((entry) => entry !== value)
          : filters.sizes,
      priceBands:
        kind === "price"
          ? filters.priceBands.filter((entry) => entry !== value)
          : filters.priceBands,
    };
    const query = buildQuery(next, sort);
    startTransition(() => {
      router.replace(withPreservedQuery(pathname, query), { scroll: false });
    });
  }

  const colorName = (slug: string) => colors.find((entry) => entry.slug === slug)?.name ?? slug;
  const activeCount =
    filters.colors.length + filters.sizes.length + filters.priceBands.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className={cn("label text-stone transition-opacity", isPending && "opacity-50")}>
          {count} {count === 1 ? "piece" : "pieces"}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="label flex items-center gap-2 border border-line px-3 py-2.5 text-ink transition-colors hover:border-ink lg:hidden"
          >
            <SlidersHorizontal className="size-3.5" strokeWidth={1.5} aria-hidden />
            Filter{activeCount ? ` (${activeCount})` : ""}
          </button>

          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <div className="relative">
          <div className="relative">
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="label cursor-pointer appearance-none border-b border-line-strong bg-transparent py-2 pr-6 text-ink transition-colors hover:border-ink focus:border-ink"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2 text-stone"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2 text-stone"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </div>
      </div>

      {isFiltering(filters) ? (
        <ul className="mt-5 flex flex-wrap items-center gap-2">
          {filters.colors.map((slug) => (
            <li key={`color-${slug}`}>
              <button
                type="button"
                onClick={() => removeFilter("color", slug)}
                className="label flex items-center gap-2 border border-line px-2.5 py-1.5 text-[0.6rem] text-stone transition-colors hover:border-ink hover:text-ink"
              >
                {colorName(slug)}
                <X className="size-2.5" aria-hidden />
                <span className="sr-only">Remove colour filter</span>
              </button>
            </li>
          ))}
          {filters.sizes.map((size) => (
            <li key={`size-${size}`}>
              <button
                type="button"
                onClick={() => removeFilter("size", size)}
                className="label flex items-center gap-2 border border-line px-2.5 py-1.5 text-[0.6rem] text-stone transition-colors hover:border-ink hover:text-ink"
              >
                {size}
                <X className="size-2.5" aria-hidden />
                <span className="sr-only">Remove size filter</span>
              </button>
            </li>
          ))}
          {filters.priceBands.map((band) => (
            <li key={`price-${band}`}>
              <button
                type="button"
                onClick={() => removeFilter("price", band)}
                className="label flex items-center gap-2 border border-line px-2.5 py-1.5 text-[0.6rem] text-stone transition-colors hover:border-ink hover:text-ink"
              >
                {PRICE_BANDS.find((entry) => entry.id === band)?.label ?? band}
                <X className="size-2.5" aria-hidden />
                <span className="sr-only">Remove price filter</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        inert={!drawerOpen}
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          tabIndex={drawerOpen ? 0 : -1}
          aria-label="Close filters"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-bone transition-transform duration-400 ease-[var(--ease-editorial)]",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="label text-ink">Filter</p>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
              className="flex size-9 items-center justify-center text-ink"
            >
              <X className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FilterPanel filters={filters} sort={sort} colors={colors} sizes={sizes} />
          </div>

          <div className="border-t border-line p-5">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="label w-full bg-ink py-4 text-bone transition-colors hover:bg-graphite"
            >
              View {count} {count === 1 ? "piece" : "pieces"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
