"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePrice } from "@/lib/preferences/use-price";
import { useT, type Translate } from "@/i18n/provider";
import { useCartStore } from "@/lib/cart/store";
import { getVariantIndex, lineStatus, type LineStatus } from "@/lib/cart/validate";
import type { CartLine } from "@/types/commerce";

function statusNote(status: LineStatus, t: Translate): string | null {
  switch (status.kind) {
    case "low-stock":
      return t("pdp.lowStock", { n: status.maxQuantity });
    case "over-stock":
      return t("cart.overStock", { n: status.maxQuantity });
    case "sold-out":
      return t("cart.soldOutSince");
    case "missing":
      return t("cart.unavailable");
    default:
      return null;
  }
}

export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const price = usePrice();
  const t = useT();
  const status = lineStatus(line, getVariantIndex());
  const dead = status.kind === "missing" || status.kind === "sold-out";
  const note = statusNote(status, t);

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/products/${line.slug}`}
        className={cn("relative shrink-0 overflow-hidden bg-sand", compact ? "w-[68px]" : "w-24")}
        aria-label={line.title}
      >
        <span className="block aspect-3/4">
          <Image
            src={line.image.src}
            alt={line.image.alt}
            fill
            sizes="96px"
            className="photo object-cover"
            style={{ objectPosition: line.image.objectPosition ?? "50% 50%" }}
          />
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[0.85rem] leading-snug text-ink">
              <Link href={`/products/${line.slug}`} className="hover:underline hover:underline-offset-4">
                {line.title}
              </Link>
            </h3>
            <p className="mt-1 text-[0.72rem] text-stone">
              {line.colorName} / {line.size}
            </p>
            <p className="tnum mt-0.5 text-[0.7rem] text-mist">
              {t("cart.each", { price: price(line.unitPrice) })}
            </p>
          </div>
          <p className="tnum shrink-0 text-[0.85rem] text-ink">
            {price({ amount: line.unitPrice.amount * line.quantity, currency: line.unitPrice.currency })}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex items-center border border-line">
            <button
              type="button"
              aria-label={t("cart.decrease", { title: line.title, size: line.size })}
              disabled={line.quantity <= 1}
              onClick={() => setQuantity(line.variantId, line.quantity - 1)}
              className={cn(
                "flex size-9 items-center justify-center text-ink transition-colors",
                line.quantity <= 1 ? "cursor-not-allowed text-mist" : "hover:bg-sand",
              )}
            >
              <Minus className="size-3" strokeWidth={1.5} aria-hidden />
            </button>
            <span className="tnum w-8 text-center text-[0.8rem] text-ink">{line.quantity}</span>
            <button
              type="button"
              aria-label={t("cart.increase", { title: line.title, size: line.size })}
              disabled={dead || line.quantity >= status.maxQuantity}
              onClick={() => setQuantity(line.variantId, line.quantity + 1)}
              className={cn(
                "flex size-9 items-center justify-center text-ink transition-colors",
                dead || line.quantity >= status.maxQuantity
                  ? "cursor-not-allowed text-mist"
                  : "hover:bg-sand",
              )}
            >
              <Plus className="size-3" strokeWidth={1.5} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeLine(line.variantId)}
            className="flex items-center gap-1 text-[0.72rem] text-stone transition-colors hover:text-ink"
          >
            <X className="size-3" strokeWidth={1.5} aria-hidden />
            {t("action.remove")}
          </button>
        </div>

        {note ? (
          <p className={cn("mt-2 text-[0.7rem]", dead ? "text-ink" : "text-stone")}>{note}</p>
        ) : null}

        <p className="sr-only">
          Unit price {price(line.unitPrice)}, SKU {line.sku}
        </p>
      </div>
    </li>
  );
}
