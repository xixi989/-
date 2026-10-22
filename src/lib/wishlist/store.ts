"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Wishlist is a list of product slugs, not a copy of product data: prices and
 * stock always come from the catalogue at read time, so a stale wishlist can
 * never serve an old price.
 */
interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((entry) => entry !== slug)
            : [...state.slugs, slug],
        })),
      add: (slug) =>
        set((state) => (state.slugs.includes(slug) ? state : { slugs: [...state.slugs, slug] })),
      remove: (slug) => set((state) => ({ slugs: state.slugs.filter((entry) => entry !== slug) })),
      clear: () => set({ slugs: [] }),
    }),
    {
      name: "aurel-wishlist",
      version: 1,
      partialize: (state) => ({ slugs: state.slugs }),
    },
  ),
);

export function isFavorite(slugs: string[], slug: string): boolean {
  return slugs.includes(slug);
}
