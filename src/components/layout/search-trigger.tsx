"use client";

import { Search } from "lucide-react";
import { useUiStore } from "@/lib/ui/store";

export function SearchTrigger() {
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search products"
      aria-haspopup="dialog"
      className="flex size-10 items-center justify-center text-ink/80 transition-colors hover:text-ink"
    >
      <Search className="size-[18px]" strokeWidth={1.25} aria-hidden />
    </button>
  );
}
