import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EmptyState({ collectionPath }: { collectionPath: string }) {
  return (
    <div className="border-t border-line py-20 md:py-28">
      <p className="label text-mist">No matches</p>
      <h2 className="display mt-4 max-w-[24ch] text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
        Nothing in this collection fits those filters.
      </h2>
      <p className="mt-4 max-w-[46ch] text-[0.85rem] leading-relaxed text-stone">
        Try removing a colour or a size. Most pieces come in two colourways, and the
        size run goes from XS to XL.
      </p>
      <Link
        href={collectionPath}
        className="label group mt-8 inline-flex items-center gap-2 border-b border-ink/30 pb-1.5 text-ink transition-colors hover:border-ink"
      >
        Clear all filters
        <ArrowRight
          className="size-3.5 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1"
          strokeWidth={1.5}
          aria-hidden
        />
      </Link>
    </div>
  );
}
