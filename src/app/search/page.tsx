import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionToolbar } from "@/components/collection/collection-toolbar";
import { EmptyState } from "@/components/collection/empty-state";
import { FilterPanel } from "@/components/collection/filter-panel";
import { ProductGrid } from "@/components/collection/product-grid";
import { Container } from "@/components/ui/container";
import { collectionList } from "@/data/collections";
import { toSummary } from "@/lib/commerce/adapter";
import { colorFacets, filterAndSort, parseFilters, parseSort, sizeFacets } from "@/lib/commerce/filters";
import { commerce } from "@/lib/commerce/mock-adapter";
import { SEARCH_SUGGESTIONS, searchProducts } from "@/lib/commerce/search";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Aurel Studio collection by piece, fabric or category.",
  robots: { index: false, follow: true },
};

function toSearchParams(input: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value)) params.set(key, value.join(","));
  }
  return params;
}

/**
 * Reading `searchParams` blocks prerendering, so it happens inside a Suspense
 * boundary: the shell stays static and the results stream in.
 */
async function SearchResults({ searchParams }: PageProps) {
  const paramsObject = await searchParams;
  const query = typeof paramsObject.q === "string" ? paramsObject.q.trim() : "";
  const urlParams = toSearchParams(paramsObject);

  const catalogue = await commerce.listProducts();
  const matched = query ? searchProducts(catalogue, query) : [];

  const filters = parseFilters(urlParams);
  const sort = parseSort(urlParams);
  const visible = filterAndSort(matched, filters, sort);
  const colors = colorFacets(matched);
  const sizes = sizeFacets(matched);
  const searchPath = `/search?q=${encodeURIComponent(query)}`;

  return (
    <>
      <header className="mt-8 max-w-[62ch] md:mt-12">
        <h1 className="display text-[clamp(2rem,5vw,3.75rem)] text-ink">
          {query ? `“${query}”` : "Search"}
        </h1>
        <p className="mt-5 text-[0.9rem] leading-relaxed text-stone">
          {query
            ? `${matched.length} ${matched.length === 1 ? "result" : "results"} across the collection.`
            : "Search by piece, fabric or category. Everything in the catalogue is indexed locally."}
        </p>
      </header>

      {!query ? (
        <div className="mt-10 border-t border-line pt-8">
          <p className="label text-mist">Try</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <Link
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="label border border-line px-3 py-2 text-stone transition-colors hover:border-ink hover:text-ink"
                >
                  {suggestion}
                </Link>
              </li>
            ))}
          </ul>

          <p className="label mt-10 text-mist">Or browse</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {collectionList.map((collection) => (
              <li key={collection.handle}>
                <Link
                  href={`/collections/${collection.handle}`}
                  className="text-[0.85rem] text-ink/75 transition-colors hover:text-ink"
                >
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : matched.length === 0 ? (
        <div className="mt-10 border-t border-line pt-8">
          <EmptyState collectionPath={searchPath} />
          <p className="mt-6 text-[0.8rem] text-stone">
            Not what you meant?{" "}
            <Link
              href="/collections/women"
              className="border-b border-ink/30 pb-0.5 text-ink hover:border-ink"
            >
              Browse the full collection
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-10 flex gap-10 lg:mt-12">
          <aside className="hidden w-[210px] shrink-0 lg:block">
            <div className="sticky top-28">
              <FilterPanel filters={filters} sort={sort} colors={colors} sizes={sizes} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <CollectionToolbar
              filters={filters}
              sort={sort}
              count={visible.length}
              colors={colors}
              sizes={sizes}
            />

            <div className="mt-8">
              {visible.length > 0 ? (
                <ProductGrid products={visible.map(toSummary)} />
              ) : (
                <EmptyState collectionPath={searchPath} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchFallback() {
  return (
    <div className="mt-8 md:mt-12">
      <div className="h-12 w-2/3 animate-pulse bg-sand md:h-14" />
      <div className="mt-5 h-3 w-1/3 animate-pulse bg-sand" />
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index}>
            <div className="aspect-3/4 animate-pulse bg-sand" />
            <div className="mt-4 h-3 w-3/4 animate-pulse bg-sand" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <div className="pb-24 md:pb-32">
      <Container>
        <nav aria-label="Breadcrumb" className="pt-8 md:pt-10">
          <ol className="label flex items-center gap-2 text-[0.6rem] text-mist">
            <li>
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink">Search</li>
          </ol>
        </nav>

        <Suspense fallback={<SearchFallback />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </Container>
    </div>
  );
}
