"use client";

import { useT } from "@/i18n/provider";

/**
 * The search page itself is a server component, so its headings are translated
 * here — the page keeps streaming while this small island re-renders on a
 * language switch.
 */
export function SearchHeading({ query, count }: { query: string; count: number }) {
  const t = useT();

  return (
    <header className="mt-8 max-w-[62ch] md:mt-12">
      <h1 className="display text-[clamp(2rem,5vw,3.75rem)] text-ink">
        {query ? `“${query}”` : t("search.pageTitle")}
      </h1>
      <p className="mt-5 text-[0.9rem] leading-relaxed text-stone">
        {query ? t("search.resultsAcross", { n: count }) : t("search.pageIntro")}
      </p>
    </header>
  );
}
