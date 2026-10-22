"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/lib/wishlist/store";
import { useT } from "@/i18n/provider";

export function WishlistLink() {
  const t = useT();
  const count = useSyncExternalStore(
    useWishlistStore.subscribe,
    () => useWishlistStore.getState().slugs.length,
    () => 0,
  );

  return (
    <Link
      href="/wishlist"
      aria-label={t("wishlist.linkLabel", { n: count })}
      className="relative flex size-10 items-center justify-center text-ink/80 transition-colors hover:text-ink"
    >
      <Heart className="size-[18px]" strokeWidth={1.25} aria-hidden />
      {count > 0 ? (
        <span className="label tnum absolute top-1.5 right-1 text-[0.55rem] text-ink">{count}</span>
      ) : null}
    </Link>
  );
}
