import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getContentPage } from "@/data/content";
import { absoluteUrl, canonicalFor, site } from "@/lib/site-config";

export function metadataFor(slug: string): Metadata {
  const page = getContentPage(slug);
  if (!page) return { title: "Page not found" };

  return {
    title: page.title,
    description: page.intro,
    alternates: canonicalFor(`/${page.slug}`),
    openGraph: {
      type: "article",
      siteName: site.name,
      title: `${page.title} — ${site.name}`,
      description: page.intro,
      url: absoluteUrl(`/${page.slug}`),
    },
  };
}

/**
 * One layout for every editorial and client-care page, so nine routes do not
 * become nine designs. Content comes from `data/content.ts`.
 */
export function InfoPage({ slug }: { slug: string }) {
  const page = getContentPage(slug);
  if (!page) return null;

  return (
    <article className="pb-24 md:pb-32">
      <Container>
        <nav aria-label="Breadcrumb" className="pt-8 md:pt-10">
          <ol className="label flex items-center gap-2 text-[0.6rem] text-mist">
            <li>
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink">{page.title}</li>
          </ol>
        </nav>

        <header className="mt-10 max-w-[62ch] md:mt-14">
          <h1 className="display text-[clamp(2rem,5vw,3.5rem)] text-ink">{page.title}</h1>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-stone">{page.intro}</p>
        </header>

        <div className="mt-14 max-w-[68ch] border-t border-line pt-10 md:mt-20">
          {page.sections.map((section) => (
            <section key={section.heading} className="mt-10 first:mt-0">
              <h2 className="display text-[clamp(1.25rem,2.2vw,1.6rem)] text-ink">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-[0.875rem] leading-relaxed text-stone">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-8">
          <Link
            href="/collections/women"
            className="label border-b border-ink pb-1.5 text-ink transition-opacity hover:opacity-60"
          >
            Shop the collection
          </Link>
          <Link href="/journal" className="label text-stone transition-colors hover:text-ink">
            The Atelier Notes
          </Link>
          <Link href="/faq" className="label text-stone transition-colors hover:text-ink">
            Questions
          </Link>
        </div>
      </Container>
    </article>
  );
}
