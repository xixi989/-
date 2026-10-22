"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { isFavorite, useWishlistStore } from "@/lib/wishlist/store";
import { useT } from "@/i18n/provider";

/**
 * Server snapshot is `false`, so SSR and the first client paint agree; the real
 * saved state arrives on the next frame from the persisted store.
 */
export function WishlistButton({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const t = useT();
  const active = useSyncExternalStore(
    useWishlistStore.subscribe,
    () => isFavorite(useWishlistStore.getState().slugs, slug),
    () => false,
  );

  return (
    <button
      type="button"
      onClick={() => useWishlistStore.getState().toggle(slug)}
      aria-pressed={active}
      aria-label={t(active ? "wishlist.remove" : "wishlist.save", { title })}
      className={cn(
        // The hairline matters: over a pale lookbook frame the bone chip would
        // otherwise disappear and the heart would float unanchored.
        "flex size-9 items-center justify-center border border-line/70 bg-bone/90 text-ink transition-colors hover:bg-bone hover:text-ink",
        className,
      )}
    >
      <Heart
        className={cn("size-4 transition-[fill,color] duration-200", active && "fill-ink")}
        strokeWidth={1.25}
        aria-hidden
      />
    </button>
  );
}
