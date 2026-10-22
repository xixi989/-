"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrice } from "@/lib/preferences/use-price";
import { useT } from "@/i18n/provider";
import { useCartStore } from "@/lib/cart/store";
import { lineFromSummary } from "@/lib/cart/lines";
import type { ProductSummary, SizeCode } from "@/types/commerce";

export function QuickView({
  product,
  onClose,
}: {
  product: ProductSummary;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<SizeCode | null>(null);
  const [added, setAdded] = useState(false);
  const addLine = useCartStore((state) => state.addLine);
  const price = usePrice();
  const t = useT();
  const image = product.images[0];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function handleAdd() {
    if (!size) return;
    const line = lineFromSummary(product, size);
    if (!line) return;
    addLine(line);
    setAdded(true);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label="Close quick view"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-y-auto bg-bone sm:max-h-[88vh] md:grid-cols-2"
      >
        <div className="relative aspect-3/4 bg-sand md:aspect-auto md:min-h-[520px]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="photo object-cover"
            style={{ objectPosition: image.objectPosition ?? "50% 50%" }}
          />
        </div>

        <div className="flex flex-col p-6 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <p className="label text-mist">{product.categoryLabel}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-2 -mr-2 flex size-9 items-center justify-center text-ink/70 transition-colors hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>

          <h2 id={titleId} className="display mt-4 text-[clamp(1.5rem,3vw,2.1rem)] text-ink">
            {product.title}
          </h2>

          <p className="tnum mt-3 text-[0.95rem] text-ink">
            {price(product.price)}
            {product.compareAtPrice ? (
              <span className="ml-3 text-[0.8rem] text-mist line-through">
                {price(product.compareAtPrice)}
              </span>
            ) : null}
          </p>

          <p className="mt-6 text-[0.8rem] text-stone">
            {t("pdp.colour")} — {product.defaultColorName}
          </p>
          <ul className="mt-2 flex items-center gap-2" aria-hidden>
            {product.colors.map((color) => (
              <li
                key={color.slug}
                className="size-4 rounded-full ring-1 ring-ink/20"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </ul>

          <div className="mt-7">
            <p className="label text-mist">Size</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.sizeStock.map((entry) => (
                <li key={entry.size}>
                  <button
                    type="button"
                    disabled={!entry.inStock}
                    aria-pressed={size === entry.size}
                    onClick={() => {
                      setSize(entry.size);
                      setAdded(false);
                    }}
                    className={cn(
                      "label min-w-11 border px-3 py-2.5 transition-colors",
                      !entry.inStock &&
                        "cursor-not-allowed border-line text-mist line-through",
                      entry.inStock && size === entry.size
                        ? "border-ink bg-ink text-bone"
                        : "border-line text-ink hover:border-ink",
                    )}
                  >
                    {entry.size}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            disabled={!size}
            onClick={handleAdd}
            className={cn(
              "label mt-8 w-full py-4 transition-colors",
              size
                ? "bg-ink text-bone hover:bg-graphite"
                : "cursor-not-allowed bg-sand text-mist",
            )}
          >
            {added ? t("pdp.addedToBag") : size ? t("pdp.addToBag") : t("pdp.selectSize")}
          </button>

          <p aria-live="polite" className="sr-only">
            {added ? `${product.title} added to your bag` : ""}
          </p>

          <Link
            href={`/products/${product.slug}`}
            className="label mt-6 self-start border-b border-ink/30 pb-1 text-ink transition-colors hover:border-ink"
          >
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
