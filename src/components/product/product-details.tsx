"use client";

import type { Product } from "@/types/commerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart/logic";
import { useFormatUsdCents } from "@/lib/preferences/use-price";
import { useT } from "@/i18n/provider";

/**
 * Material, care and delivery as real content rather than an accordion.
 *
 * Client component because the shipping bullets contain an amount that follows
 * the selected currency — a hard-coded "$150" here was the visible half of the
 * cross-border inconsistency.
 */
export function ProductDetails({ product }: { product: Product }) {
  const t = useT();
  const format = useFormatUsdCents();

  return (
    <section aria-labelledby="details-heading" className="mt-20 border-t border-line pt-12 md:mt-28">
      <h2 id="details-heading" className="label text-mist">
        {t("pdp.detailsCare")}
      </h2>

      <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
        <div>
          <h3 className="text-[0.9rem] text-ink">{t("pdp.material")}</h3>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-stone">{product.material}</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {product.tags.map((tag) => (
              <li key={tag} className="label text-[0.6rem] text-mist">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.9rem] text-ink">{t("pdp.care")}</h3>
          <ul className="mt-3 space-y-2">
            {product.careInstructions.map((instruction) => (
              <li key={instruction} className="text-[0.8rem] leading-relaxed text-stone">
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.9rem] text-ink">{t("pdp.shippingReturns")}</h3>
          <ul className="mt-3 space-y-2 text-[0.8rem] leading-relaxed text-stone">
            <li>{t("pdp.shipFree", { amount: format(FREE_SHIPPING_THRESHOLD) })}</li>
            <li>{t("pdp.shipDispatch")}</li>
            <li>{t("pdp.shipReturns")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
