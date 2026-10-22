import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/product-details";
import { ProductView } from "@/components/product/product-view";
import { ProductGrid } from "@/components/collection/product-grid";
import { Container } from "@/components/ui/container";
import { absoluteUrl, canonicalFor, site } from "@/lib/site-config";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/structured-data";
import { getCollectionMeta } from "@/data/collections";
import { toSummary } from "@/lib/commerce/adapter";
import { commerce } from "@/lib/commerce/mock-adapter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await commerce.listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await commerce.getProduct(slug);
  if (!product) return { title: "Product not found" };

  const path = `/products/${product.slug}`;
  const image = product.colors[0]?.images[0];
  const ogImage = image ? absoluteUrl(image.src) : undefined;

  return {
    title: product.title,
    description: product.description,
    alternates: canonicalFor(path),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${product.title} — ${site.name}`,
      description: product.description,
      url: absoluteUrl(path),
      // The product's own photography, not a generic brand image.
      ...(ogImage ? { images: [{ url: ogImage, alt: image.alt }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — ${site.name}`,
      description: product.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await commerce.getProduct(slug);
  if (!product) notFound();

  const related = await commerce.getRelatedProducts(slug, 4);
  const category = getCollectionMeta(product.category);

  return (
    <div className="pb-24 md:pb-32">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: category?.title ?? product.category, path: `/collections/${product.category}` },
          { name: product.title, path: `/products/${product.slug}` },
        ]}
      />
      <Container>
        <nav aria-label="Breadcrumb" className="pt-8 md:pt-10">
          <ol className="label flex flex-wrap items-center gap-2 text-[0.6rem] text-mist">
            <li>
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/collections/${product.category}`} className="transition-colors hover:text-ink">
                {category?.title ?? product.category}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink">{product.title}</li>
          </ol>
        </nav>

        <div className="mt-8 md:mt-12">
          <ProductView product={product} />
        </div>

        <ProductDetails product={product} />

        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-20 border-t border-line pt-12 md:mt-28">
            <div className="flex items-end justify-between gap-8">
              <h2
                id="related-heading"
                className="display text-[clamp(1.5rem,2.8vw,2.1rem)] text-ink"
              >
                Worn with
              </h2>
              <Link
                href={`/collections/${product.category}`}
                className="label text-stone transition-colors hover:text-ink"
              >
                View all
              </Link>
            </div>

            <div className="mt-10">
              <ProductGrid products={related.map(toSummary)} />
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
