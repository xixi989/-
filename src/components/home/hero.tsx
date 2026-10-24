import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section aria-labelledby="campaign-heading" className="relative isolate">
      <div className="relative h-[82svh] max-h-[880px] min-h-[540px] w-full overflow-hidden bg-graphite">
        <Image
          src="/images/hero-women.jpg"
          alt="Model wearing the Autumn Winter 2026 white cotton tee and shorts in daylight"
          fill
          priority
          quality={72}
          sizes="100vw"
          className="photo object-cover"
          style={{ objectPosition: "58% 26%" }}
        />

        {/* Tone unification, then two scrims: bottom for the headline, left for
            the copy column. The campaign frame is bright on the left, so a single
            bottom ramp is not enough to hold cream text at AA. */}
        <div className="absolute inset-0 bg-ink/15" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-[72%] bg-linear-to-t from-ink/80 via-ink/30 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 w-[58%] bg-linear-to-r from-ink/55 via-ink/15 to-transparent"
          aria-hidden
        />

        <Container className="relative flex h-full flex-col justify-end pb-12 md:pb-16">
          <h1
            id="campaign-heading"
            className="display max-w-[15ch] text-[clamp(2.6rem,8vw,8.25rem)] text-cream"
          >
            Designed for the way you live.
          </h1>

          <div className="mt-9 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link
                href="/collections/women"
                className="label group inline-flex items-center gap-3 border-b border-cream/50 pb-2 text-cream transition-colors duration-300 hover:border-cream"
              >
                Shop the collection
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>

              <Link
                href="/editorial"
                className="label text-cream/85 transition-colors duration-300 hover:text-cream"
              >
                View the lookbook
              </Link>
            </div>

            <p className="label hidden text-cream/85 md:block">
              Autumn Winter 2026 · 01 / 03
            </p>
          </div>
        </Container>
      </div>
    </section>
  );
}
