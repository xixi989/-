import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { collectionEntries } from "@/data/products";

export function CollectionEntries() {
  return (
    <section aria-label="Shop by collection" className="py-20 md:py-28">
      <Container>
        <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 md:gap-x-8">
          {collectionEntries.map((entry, index) => (
            <Reveal
              key={entry.handle}
              delayMs={index * 90}
              /* The second card drops down: the pair reads as a spread, not a row. */
              className={cn(index === 1 && "md:mt-28")}
            >
              <Link href={entry.href} className="group block">
                <div className="relative aspect-3/4 overflow-hidden bg-sand">
                  <Image
                    src={entry.image.src}
                    alt={entry.image.alt}
                    fill
                    sizes="(min-width: 768px) 46vw, 92vw"
                    className="photo object-cover transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover:scale-[1.035] group-focus-visible:scale-[1.035]"
                    style={{ objectPosition: entry.image.objectPosition ?? "50% 50%" }}
                  />
                </div>

                <div className="mt-6 flex items-end justify-between gap-8">
                  <div>
                    <p className="label text-mist">{entry.eyebrow}</p>
                    <h2 className="display mt-4 text-[clamp(1.6rem,3vw,2.5rem)] text-ink">
                      {entry.title}
                    </h2>
                    <p className="mt-4 max-w-[34ch] text-[0.85rem] leading-relaxed text-stone">
                      {entry.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="mb-1 size-5 shrink-0 text-ink transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
