import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function EditorialBand() {
  return (
    <section aria-labelledby="editorial-heading" className="relative isolate">
      <div className="relative h-[560px] w-full overflow-hidden bg-graphite md:h-[680px]">
        <Image
          src="/images/editorial-form-wide.jpg"
          alt="An atelier dress form in a dim workroom, a half-finished garment pinned to it"
          fill
          sizes="100vw"
          className="photo object-cover"
          style={{ objectPosition: "50% 45%" }}
        />

        <div className="absolute inset-0 bg-ink/25" aria-hidden />

        <Container className="relative flex h-full items-center">
          <div className="max-w-[34ch]">
            <h2
              id="editorial-heading"
              className="display text-[clamp(1.9rem,4.2vw,3.5rem)] text-cream"
            >
              On making fewer things, properly.
            </h2>

            <p className="mt-6 text-[0.9rem] leading-relaxed text-cream/85">
              Every piece starts on the stand, not on a screen. We cut the pattern,
              wear it for a season, then cut it again. Which is why the collection
              grows slowly, and stays.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/editorial"
                className="label group inline-flex items-center gap-3 border-b border-cream/50 pb-2 text-cream transition-colors duration-300 hover:border-cream"
              >
                Read the story
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
              <p className="label text-cream/70">The Atelier Notes · Issue 04</p>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
