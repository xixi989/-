import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionToolbar } from "@/components/collection/collection-toolbar";
import { EmptyState } from "@/components/collection/empty-state";
import { FilterPanel } from "@/components/collection/filter-panel";
import { ProductGrid } from "@/components/collection/product-grid";
import { Container } from "@/components/ui/container";
import { collectionList, getCollectionMeta } from "@/data/collections";
import { toSummary } from "@/lib/commerce/adapter";
import { commerce } from "@/lib/commerce/mock-adapter";
import { colorFacets, filterAndSort, parseFilters, parseSort, sizeFacets } from "@/lib/commerce/filters";
import { absoluteUrl, canonicalFor } from "@/lib/site-config";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateStaticParams() {
  return collectionList.map((collection) => ({ slug: collection.handle }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCollectionMeta(slug);
  if (!meta) return { title: "Collection not found" };

  // A filtered view is a different page for a shopper and a duplicate for a
  // crawler: it canonicalises back to the clean collection and stays out of the
  // index. The filter combination itself is still fully usable.
  const query = await searchParams;
  const filtered = ["color", "size", "price", "sort"].some((key) => Boolean(query[key]));
  const path = `/collections/${meta.handle}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: canonicalFor(path),
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title: `${meta.title} — AUREL STUDIO`,
      description: meta.description,
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} — AUREL STUDIO`,
      description: meta.description,
    },
  };
}

function toSearchParams(input: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value)) params.set(key, value.join(","));
  }
  return params;
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const meta = getCollectionMeta(slug);
  if (!meta) notFound();

  const paramsObject = await searchParams;
  const urlParams = toSearchParams(paramsObject);
  const filters = parseFilters(urlParams);
  const sort = parseSort(urlParams);

  // Facets come from the whole collection, not the filtered slice, so a selected
  // colour never removes the other options from the panel.
  const allProducts = await commerce.listProducts(meta.handle);
  const visible = filterAndSort(allProducts, filters, sort);

  const colors = colorFacets(allProducts);
  const sizes = sizeFacets(allProducts);

  return (
    <div className="pb-24 md:pb-32">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: meta.title, path: `/collections/${meta.handle}` },
        ]}
      />
      <Container>
        <nav aria-label="Breadcrumb" className="pt-8 md:pt-10">
          <ol className="label flex items-center gap-2 text-[0.6rem] text-mist">
            <li>
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink">{meta.title}</li>
          </ol>
        </nav>

        <header className="mt-8 max-w-[62ch] md:mt-12">
          <h1 className="display text-[clamp(2rem,5vw,3.75rem)] text-ink">{meta.title}</h1>
          <p className="mt-5 text-[0.9rem] leading-relaxed text-stone">{meta.description}</p>
        </header>

        <nav aria-label="Categories" className="mt-10 border-y border-line">
          <ul className="-mx-1 flex gap-x-1 overflow-x-auto py-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
            {collectionList.map((collection) => {
              const active = collection.handle === meta.handle;
              return (
                <li key={collection.handle}>
                  <Link
                    href={`/collections/${collection.handle}`}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "label block shrink-0 px-3 py-3 whitespace-nowrap text-ink"
                        : "label block shrink-0 px-3 py-3 whitespace-nowrap text-stone transition-colors hover:text-ink"
                    }
                  >
                    {collection.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

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
                <EmptyState collectionPath={`/collections/${meta.handle}`} />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
