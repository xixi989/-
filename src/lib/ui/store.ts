"use client";

import { create } from "zustand";

/**
 * Which overlay is open. Kept separate from commerce state so the cart store
 * stays about lines and money, not about pixels.
 */
interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  // Only one overlay at a time: opening the drawer closes the search dialog.
  openCart: () => set({ cartOpen: true, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
}));
