import type { Metadata } from "next";
import { BrandStatement } from "@/components/home/brand-statement";
import { CollectionEntries } from "@/components/home/collection-entries";
import { EditorialBand } from "@/components/home/editorial-band";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Newsletter } from "@/components/home/newsletter";
import { absoluteUrl, canonicalFor, site } from "@/lib/site-config";

export const metadata: Metadata = {
  alternates: canonicalFor("/"),
  openGraph: {
    // A page-level openGraph object replaces the layout's, so type and siteName
    // have to be restated here or they silently disappear from the homepage.
    type: "website",
    siteName: site.name,
    title: `${site.name} — Contemporary Essentials`,
    description: site.description,
    url: absoluteUrl("/"),
    images: [{ url: site.defaultOgImage, alt: `${site.name} campaign` }],
  },
};

/**
 * Homepage composition.
 *
 * Order is rhythm, not hierarchy: a full-bleed opening, two asymmetric
 * collection entries, a dense product row, then a quiet dark interlude before
 * the brand argument and the signup. No two adjacent sections share a layout.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <CollectionEntries />
      <NewArrivals />
      <EditorialBand />
      <BrandStatement />
      <Newsletter />
    </>
  );
}
