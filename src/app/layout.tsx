import type { Metadata } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CommerceLayer } from "@/components/cart/commerce-layer";
import { LocaleProvider } from "@/i18n/provider";
import { absoluteUrl, indexingEnabled, site, siteUrl } from "@/lib/site-config";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-schibsted",
  display: "swap",
});

/**
 * Site-wide metadata. Canonical URLs are set per page, never here — a root
 * canonical would make every product claim to be the homepage.
 *
 * Without SITE_URL there is no metadataBase, so the build emits no absolute
 * URLs at all rather than inventing a domain or shipping localhost.
 */
export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: `${site.name} — Contemporary Essentials`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "contemporary essentials",
    "minimal womenswear",
    "minimal menswear",
    "natural fibres",
    "slow fashion",
    "timeless clothing",
  ],
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
  formatDetection: { telephone: false, address: false, email: false },
  // Indexable pages need no robots tag at all (indexing is the default), and
  // omitting it keeps the 404 page free of a contradictory "index, follow".
  // A demo deployment still opts out site-wide here.
  ...(indexingEnabled ? {} : { robots: { index: false, follow: false, nocache: true } }),
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Contemporary Essentials`,
    description: site.description,
    locale: "en_US",
    url: absoluteUrl("/"),
    images: [{ url: site.defaultOgImage, alt: `${site.name} campaign` }],
  },
  twitter: {
    card: site.twitterCard,
    title: `${site.name} — Contemporary Essentials`,
    description: site.description,
    images: [site.defaultOgImage],
  },
  // Icons come from the file convention (src/app/icon.svg); the old absolute
  // /favicon.ico reference 404d on every page.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${schibstedGrotesk.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-bone text-ink antialiased">
        <LocaleProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:text-bone"
          >
            Skip to content
          </a>

          <AnnouncementBar />
          <SiteHeader />

          <main id="main" className="flex-1">
            {children}
          </main>

          <SiteFooter />

          <CommerceLayer />

          {/* Without JS the reveal wrapper never hides anything; this is belt and braces. */}
          <noscript>
            <style>{`[data-reveal="pending"]{opacity:1!important;transform:none!important}`}</style>
          </noscript>
        </LocaleProvider>
      </body>
    </html>
  );
}
