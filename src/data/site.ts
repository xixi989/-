import type { DictionaryKey } from "@/i18n/dictionaries";

/**
 * Navigation and footer content is labelled by dictionary key, not by string.
 * The components translate at render time, so switching language changes the
 * chrome without duplicating this data per locale.
 */
export interface NavLink {
  href: string;
  labelKey: DictionaryKey;
  /** USD minor units interpolated into the label (price-band links). */
  priceAmount?: number;
}

export interface NavGroup {
  titleKey: DictionaryKey;
  links: NavLink[];
}

export interface NavItem {
  labelKey: DictionaryKey;
  href: string;
  /** Present on Women / Men only — drives the desktop mega menu. */
  groups?: NavGroup[];
}

/** Every href here resolves to a real route or a real filtered view. */
export const primaryNav: NavItem[] = [
  {
    labelKey: "nav.women",
    href: "/collections/women",
    groups: [
      {
        titleKey: "nav.clothing",
        links: [
          { labelKey: "nav.allWomen", href: "/collections/women" },
          { labelKey: "nav.knitwear", href: "/collections/knitwear" },
          { labelKey: "nav.shirts", href: "/collections/shirts" },
          { labelKey: "nav.trousers", href: "/collections/trousers" },
          { labelKey: "nav.outerwear", href: "/collections/outerwear" },
        ],
      },
      {
        titleKey: "nav.shopBy",
        links: [
          { labelKey: "nav.newArrivals", href: "/collections/women?sort=newest" },
          { labelKey: "nav.bestSellers", href: "/collections/women?sort=featured" },
          {
            labelKey: "nav.underAmount",
            href: "/collections/women?price=under-100",
            priceAmount: 10000,
          },
          { labelKey: "nav.accessories", href: "/collections/accessories" },
        ],
      },
    ],
  },
  {
    labelKey: "nav.men",
    href: "/collections/men",
    groups: [
      {
        titleKey: "nav.clothing",
        links: [
          { labelKey: "nav.allMen", href: "/collections/men" },
          { labelKey: "nav.knitwear", href: "/collections/knitwear" },
          { labelKey: "nav.shirts", href: "/collections/shirts" },
          { labelKey: "nav.trousers", href: "/collections/trousers" },
          { labelKey: "nav.outerwear", href: "/collections/outerwear" },
        ],
      },
      {
        titleKey: "nav.shopBy",
        links: [
          { labelKey: "nav.newArrivals", href: "/collections/men?sort=newest" },
          { labelKey: "nav.bestSellers", href: "/collections/men?sort=featured" },
          {
            labelKey: "nav.underAmount",
            href: "/collections/men?price=under-100",
            priceAmount: 10000,
          },
          { labelKey: "nav.accessories", href: "/collections/accessories" },
        ],
      },
    ],
  },
  { labelKey: "nav.knitwear", href: "/collections/knitwear" },
  { labelKey: "nav.outerwear", href: "/collections/outerwear" },
  { labelKey: "nav.accessories", href: "/collections/accessories" },
];

export interface FooterColumn {
  titleKey: DictionaryKey;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    titleKey: "footer.shop",
    links: [
      { labelKey: "nav.women", href: "/collections/women" },
      { labelKey: "nav.men", href: "/collections/men" },
      { labelKey: "nav.knitwear", href: "/collections/knitwear" },
      { labelKey: "nav.accessories", href: "/collections/accessories" },
    ],
  },
  {
    titleKey: "footer.clientCare",
    links: [
      { labelKey: "footer.shipping", href: "/shipping" },
      { labelKey: "footer.returns", href: "/returns" },
      { labelKey: "footer.sizeGuide", href: "/faq" },
      { labelKey: "footer.contact", href: "/contact" },
    ],
  },
  {
    titleKey: "footer.studio",
    links: [
      { labelKey: "nav.outerwear", href: "/collections/outerwear" },
      { labelKey: "nav.shirts", href: "/collections/shirts" },
      { labelKey: "nav.trousers", href: "/collections/trousers" },
      { labelKey: "footer.allPieces", href: "/collections/women" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { labelKey: "footer.privacy", href: "/privacy" },
  { labelKey: "footer.terms", href: "/terms" },
  { labelKey: "footer.cookies", href: "/cookies" },
  { labelKey: "footer.accessibility", href: "/accessibility" },
];

export interface FooterBrand {
  name: string;
  tagline: string;
  blurb: string;
}

/** Brand copy is content, not chrome — it stays in one language on purpose. */
export const footerBrand: FooterBrand = {
  name: "Aurel Studio",
  tagline: "Designed for the way you live.",
  blurb:
    "A small studio making fewer, better clothes — cut in natural fibres and finished by hand in limited runs.",
};

/**
 * Static, not `new Date().getFullYear()`: the site is fully prerendered, and a
 * render-time clock would either break the build (Cache Components) or ship a
 * stale year. Bump this with each release.
 */
export const copyrightYear = 2026;
