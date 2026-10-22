import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="py-24 md:py-36">
      <Container>
        <div className="grid gap-10 md:grid-cols-12">
          <p className="label text-mist md:col-span-2">404</p>
          <div className="md:col-span-7 md:col-start-4">
            <h1 className="display text-[clamp(2rem,4.5vw,3.5rem)] text-ink">
              This page has been folded away.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[0.9rem] leading-relaxed text-stone">
              The piece you are looking for may have sold through, or the address is
              slightly off. The current collection is still here.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/collections/women"
                className="label border-b border-ink pb-1.5 text-ink transition-opacity hover:opacity-60"
              >
                Shop Women
              </Link>
              <Link
                href="/collections/men"
                className="label border-b border-ink/30 pb-1.5 text-ink transition-colors hover:border-ink"
              >
                Shop Men
              </Link>
              <Link href="/" className="label text-stone transition-colors hover:text-ink">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
