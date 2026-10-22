"use client";

import { Container } from "@/components/ui/container";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart/logic";
import { useFormatUsdCents } from "@/lib/preferences/use-price";
import { useT } from "@/i18n/provider";

/**
 * The threshold is one constant (USD minor units), formatted into whatever
 * currency is being browsed. It is a demonstration threshold — nothing here
 * promises a real delivery service.
 */
export function AnnouncementBar() {
  const t = useT();
  const format = useFormatUsdCents();

  return (
    <div className="bg-ink text-bone">
      <Container>
        <div className="flex h-9 items-center justify-center overflow-hidden">
          <p className="label truncate text-[0.6rem] text-bone/85 md:text-[0.65rem]">
            {t("announce.shipping", { amount: format(FREE_SHIPPING_THRESHOLD) })}
          </p>
        </div>
      </Container>
    </div>
  );
}
