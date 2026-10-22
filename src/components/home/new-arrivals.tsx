import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";
import { Reveal } from "@/components/ui/reveal";
import { toSummary } from "@/lib/commerce/adapter";
import { commerce } from "@/lib/commerce/mock-adapter";

export async function NewArrivals() {
  // Server-side read through the adapter: swapping to Storefront API later does
  // not touch this component.
  const latest = await commerce.getNewArrivals(4);

  return (
    <section aria-labelledby="new-arrivals-heading" className="border-t border-line py-20 md:py-28">
      <Container>
        <div className="flex items-end justify-between gap-8">
          <h2
            id="new-arrivals-heading"
            className="display text-[clamp(1.75rem,3.4vw,2.75rem)] text-ink"
          >
            New Arrivals
          </h2>

          <Link
            href="/collections/women?sort=newest"
            className="label group hidden items-center gap-2 pb-1 text-ink/75 transition-colors hover:text-ink md:inline-flex"
          >
            View all
            <ArrowRight
              className="size-3.5 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1"
              strokeWidth={1.5}
              aria-hidden
            />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-14 md:grid-cols-4 md:gap-x-6">
          {latest.map((product, index) => (
            <li key={product.id}>
              <Reveal delayMs={index * 70}>
                <ProductCard product={toSummary(product)} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Link
          href="/collections/women?sort=newest"
          className="label mt-12 inline-flex items-center gap-2 border-b border-ink/30 pb-1.5 text-ink transition-colors hover:border-ink md:hidden"
        >
          View all
          <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
