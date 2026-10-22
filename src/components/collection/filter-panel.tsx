"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { withPreservedQuery } from "@/lib/commerce/url";
import { useFormatUsdCents } from "@/lib/preferences/use-price";
import {
  PRICE_BANDS,
  buildQuery,
  toggleValue,
  type ColorFacet,
  type ProductFilters,
  type SortKey,
} from "@/lib/commerce/filters";
import type { SizeCode } from "@/types/commerce";

interface FilterPanelProps {
  filters: ProductFilters;
  sort: SortKey;
  colors: ColorFacet[];
  sizes: SizeCode[];
}

/**
 * Controls only — it never owns filter state. Every change rewrites the URL and
 * the server re-renders, so a filtered view is shareable and survives reload.
 */
export function FilterPanel({ filters, sort, colors, sizes }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const format = useFormatUsdCents();

  function commit(next: ProductFilters) {
    const query = buildQuery(next, sort);
    startTransition(() => {
      router.replace(withPreservedQuery(pathname, query), { scroll: false });
    });
  }

  const hasActive =
    filters.colors.length > 0 || filters.sizes.length > 0 || filters.priceBands.length > 0;

  return (
    <div
      className={cn("transition-opacity duration-200", isPending && "opacity-60")}
      aria-busy={isPending}
    >
      <div className="flex items-center justify-between">
        <p className="label text-ink">Filter</p>
        {hasActive ? (
          <button
            type="button"
            onClick={() => commit({ colors: [], sizes: [], priceBands: [] })}
            className="label text-[0.6rem] text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink"
          >
            Clear
          </button>
        ) : null}
      </div>

      <fieldset className="mt-7 border-t border-line pt-6">
        <legend className="label text-mist">Colour</legend>
        <ul className="mt-4 space-y-2.5">
          {colors.map((color) => {
            const checked = filters.colors.includes(color.slug);
            return (
              <li key={color.slug}>
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => commit({ ...filters, colors: toggleValue(filters.colors, color.slug) })}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "size-4 shrink-0 rounded-full ring-1 ring-ink/20 transition-shadow",
                      checked && "ring-2 ring-ink ring-offset-2 ring-offset-bone",
                    )}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span
                    className={cn(
                      "flex-1 text-[0.8rem] transition-colors",
                      checked ? "text-ink" : "text-stone group-hover:text-ink",
                    )}
                  >
                    {color.name}
                  </span>
                  <span className="label tnum text-[0.6rem] text-mist">{color.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="mt-8 border-t border-line pt-6">
        <legend className="label text-mist">Size</legend>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {sizes.map((size) => {
            const checked = filters.sizes.includes(size);
            return (
              <li key={size}>
                <label
                  className={cn(
                    "label block min-w-10 cursor-pointer border px-2.5 py-2 text-center text-[0.6rem] transition-colors",
                    checked
                      ? "border-ink bg-ink text-bone"
                      : "border-line text-ink hover:border-ink",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => commit({ ...filters, sizes: toggleValue(filters.sizes, size) })}
                    className="sr-only"
                  />
                  {size}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="mt-8 border-t border-line pt-6">
        <legend className="label text-mist">Price</legend>
        <ul className="mt-4 space-y-2.5">
          {PRICE_BANDS.map((band) => {
            const checked = filters.priceBands.includes(band.id);
            return (
              <li key={band.id}>
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      commit({ ...filters, priceBands: toggleValue(filters.priceBands, band.id) })
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center border transition-colors",
                      checked ? "border-ink bg-ink" : "border-line-strong group-hover:border-ink",
                    )}
                  >
                    {checked ? (
                      <svg viewBox="0 0 10 8" className="size-2 text-bone" aria-hidden>
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-[0.8rem] transition-colors",
                      checked ? "text-ink" : "text-stone group-hover:text-ink",
                    )}
                  >
                    {band.max === null
                      ? `${format(band.min)}+`
                      : band.min === 0
                        ? `Under ${format(band.max)}`
                        : `${format(band.min)} – ${format(band.max)}`}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p className="mt-8 border-t border-line pt-6 text-[0.72rem] leading-relaxed text-mist">
        Stock is live. Sold-out sizes cannot be added to the bag.
      </p>
    </div>
  );
}
