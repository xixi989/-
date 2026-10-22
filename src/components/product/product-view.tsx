"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrice } from "@/lib/preferences/use-price";
import { useT } from "@/i18n/provider";
import {
  findVariant,
  firstAvailableColorSlug,
  isColorAvailable,
  sizesForColor,
} from "@/lib/commerce/adapter";
import { useCartStore } from "@/lib/cart/store";
import { lineFromVariant } from "@/lib/cart/lines";
import type { Product, SizeCode } from "@/types/commerce";
import { useUiStore } from "@/lib/ui/store";
import { SizeGuide } from "./size-guide";

/**
 * Gallery and purchase controls share one state machine, because switching
 * colour must change the photography, the available sizes and the selected SKU
 * together. Splitting them would let the three drift apart.
 */
export function ProductView({ product }: { product: Product }) {
  const [colorSlug, setColorSlug] = useState(() => firstAvailableColorSlug(product));
  const [size, setSize] = useState<SizeCode | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const addLine = useCartStore((state) => state.addLine);
  const price = usePrice();
  const t = useT();
  const openCart = useUiStore((state) => state.openCart);

  const color = product.colors.find((entry) => entry.slug === colorSlug) ?? product.colors[0];
  const images = color.images;
  const image = images[Math.min(activeImage, images.length - 1)];
  const sizeInfo = sizesForColor(product, colorSlug);
  const variant = size ? findVariant(product, colorSlug, size) : undefined;
  const canAdd = Boolean(variant && variant.inventory > 0);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [zoomOpen]);

  function selectColor(nextSlug: string) {
    setColorSlug(nextSlug);
    setActiveImage(0);
    setAdded(false);
    if (size) {
      const nextVariant = findVariant(product, nextSlug, size);
      if (!nextVariant || nextVariant.inventory <= 0) setSize(null);
    }
  }

  function selectSize(nextSize: SizeCode) {
    setSize(nextSize);
    setAdded(false);
  }

  function handleAdd() {
    if (!variant || variant.inventory <= 0 || !size) return;
    addLine(lineFromVariant(product, variant, size));
    setAdded(true);
    openCart();
  }

  const stockLabel = (() => {
    if (!size) return t("pdp.selectSizeFirst");
    if (!variant || variant.inventory <= 0) return t("pdp.soldOutInSize");
    if (variant.inventory <= 2) return `${t("pdp.lowStock", { n: variant.inventory })} — ${color.name}`;
    return `${t("pdp.inStock")} — ${color.name} / ${size}`;
  })();

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        {/* Gallery */}
        <div>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label={t("pdp.enlarge")}
            className="relative block aspect-3/4 w-full overflow-hidden bg-sand"
          >
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="photo object-cover transition-opacity duration-300"
              style={{ objectPosition: image.objectPosition ?? "50% 50%" }}
            />
          </button>

          {images.length > 1 ? (
            <ul className="mt-3 flex gap-3">
              {images.map((entry, index) => (
                <li key={entry.src}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-pressed={index === Math.min(activeImage, images.length - 1)}
                    aria-label={`View image ${index + 1}`}
                    className={cn(
                      "relative block aspect-3/4 w-20 overflow-hidden bg-sand transition-opacity",
                      index === Math.min(activeImage, images.length - 1)
                        ? "opacity-100 ring-1 ring-ink"
                        : "opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={entry.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="photo object-cover"
                      style={{ objectPosition: entry.objectPosition ?? "50% 50%" }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Purchase */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label text-mist">{product.subtitle}</p>
          <h1 className="display mt-4 text-[clamp(1.7rem,3.4vw,2.5rem)] text-ink">
            {product.title}
          </h1>

          <p className="tnum mt-4 text-[1.05rem] text-ink">
            {price(product.price)}
            {product.compareAtPrice ? (
              <span className="ml-3 text-[0.85rem] text-mist line-through">
                {price(product.compareAtPrice)}
              </span>
            ) : null}
          </p>

          <p className="mt-5 text-[0.85rem] leading-relaxed text-stone">{product.description}</p>

          {/* Colour */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <p className="label text-mist">{t("pdp.colour")}</p>
              <p className="text-[0.8rem] text-ink">{color.name}</p>
            </div>
            <ul className="mt-3 flex items-center gap-2.5">
              {product.colors.map((entry) => {
                const available = isColorAvailable(product, entry.slug);
                const selected = entry.slug === colorSlug;
                return (
                  <li key={entry.slug}>
                    <button
                      type="button"
                      onClick={() => selectColor(entry.slug)}
                      aria-pressed={selected}
                      aria-label={`${entry.name}${available ? "" : " — sold out"}`}
                      className={cn(
                        "block size-6 rounded-full ring-1 ring-ink/20 transition-all",
                        selected && "ring-2 ring-ink ring-offset-2 ring-offset-bone",
                        !available && "opacity-40",
                      )}
                      style={{ backgroundColor: entry.hex }}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Size */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <p className="label text-mist">{t("pdp.size")}</p>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="label text-[0.6rem] text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                {t("pdp.sizeGuide")}
              </button>
            </div>

            <ul className="mt-3 flex flex-wrap gap-2">
              {sizeInfo.map((entry) => (
                <li key={entry.size}>
                  <button
                    type="button"
                    disabled={!entry.inStock}
                    onClick={() => selectSize(entry.size)}
                    aria-pressed={size === entry.size}
                    className={cn(
                      "label min-w-12 border px-3 py-3 transition-colors",
                      !entry.inStock && "cursor-not-allowed border-line text-mist line-through",
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

          <p className="mt-5 text-[0.75rem] text-stone">{stockLabel}</p>

          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className={cn(
              "label mt-6 flex w-full items-center justify-center gap-2 py-4 transition-colors",
              canAdd ? "bg-ink text-bone hover:bg-graphite" : "cursor-not-allowed bg-sand text-mist",
            )}
          >
            {added ? <Check className="size-3.5" aria-hidden /> : null}
            {added ? t("pdp.addedToBag") : canAdd ? t("pdp.addToBag") : size ? t("pdp.soldOut") : t("pdp.selectSize")}
          </button>

          <p aria-live="polite" className="mt-3 min-h-4 text-[0.75rem] text-stone">
            {added ? `${product.title}, ${color.name}, size ${size} added to your bag.` : ""}
          </p>

          <dl className="mt-8 space-y-4 border-t border-line pt-6 text-[0.78rem]">
            <div>
              <dt className="label text-mist">{t("pdp.fit")}</dt>
              <dd className="mt-1.5 leading-relaxed text-stone">{product.fit}</dd>
            </div>
            <div>
              <dt className="label text-mist">{t("pdp.delivery")}</dt>
              <dd className="mt-1.5 leading-relaxed text-stone">
                Complimentary shipping over $150. Free returns within 30 days.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {zoomOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4">
          <button
            type="button"
            aria-label="Close enlarged image"
            onClick={() => setZoomOpen(false)}
            className="absolute inset-0"
          />
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center text-bone"
          >
            <X className="size-5" strokeWidth={1.25} aria-hidden />
          </button>
          <div className="relative z-10 h-[88vh] w-full max-w-4xl">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}

      {guideOpen ? <SizeGuide onClose={() => setGuideOpen(false)} /> : null}
    </>
  );
}
