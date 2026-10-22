export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href: string;
  /** Present on Women / Men only — drives the desktop mega menu. */
  groups?: NavGroup[];
}

/** Every href here resolves to a real route or a real filtered view. */
export const primaryNav: NavItem[] = [
  {
    label: "Women",
    href: "/collections/women",
    groups: [
      {
        title: "Clothing",
        links: [
          { label: "All Women's", href: "/collections/women" },
          { label: "Knitwear", href: "/collections/knitwear" },
          { label: "Shirts", href: "/collections/shirts" },
          { label: "Trousers", href: "/collections/trousers" },
          { label: "Outerwear", href: "/collections/outerwear" },
        ],
      },
      {
        title: "Shop by",
        links: [
          { label: "New Arrivals", href: "/collections/women?sort=newest" },
          { label: "Best Sellers", href: "/collections/women?sort=featured" },
          { label: "Under $100", href: "/collections/women?price=under-100" },
          { label: "Accessories", href: "/collections/accessories" },
        ],
      },
    ],
  },
  {
    label: "Men",
    href: "/collections/men",
    groups: [
      {
        title: "Clothing",
        links: [
          { label: "All Men's", href: "/collections/men" },
          { label: "Knitwear", href: "/collections/knitwear" },
          { label: "Shirts", href: "/collections/shirts" },
          { label: "Trousers", href: "/collections/trousers" },
          { label: "Outerwear", href: "/collections/outerwear" },
        ],
      },
      {
        title: "Shop by",
        links: [
          { label: "New Arrivals", href: "/collections/men?sort=newest" },
          { label: "Best Sellers", href: "/collections/men?sort=featured" },
          { label: "Under $100", href: "/collections/men?price=under-100" },
          { label: "Accessories", href: "/collections/accessories" },
        ],
      },
    ],
  },
  { label: "Knitwear", href: "/collections/knitwear" },
  { label: "Outerwear", href: "/collections/outerwear" },
  { label: "Accessories", href: "/collections/accessories" },
];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Women", href: "/collections/women" },
      { label: "Men", href: "/collections/men" },
      { label: "Knitwear", href: "/collections/knitwear" },
      { label: "Accessories", href: "/collections/accessories" },
    ],
  },
  {
    title: "Client Care",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Size guide", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Outerwear", href: "/collections/outerwear" },
      { label: "Shirts", href: "/collections/shirts" },
      { label: "Trousers", href: "/collections/trousers" },
      { label: "All pieces", href: "/collections/women" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
];

export const announcements: string[] = [
  "Complimentary shipping on orders over $150 — United States, United Kingdom & EU",
  "Autumn Winter 2026 — the first drop is now in store",
];

/**
 * Static, not `new Date().getFullYear()`: the site is fully prerendered, and a
 * render-time clock would either break the build (Cache Components) or ship a
 * stale year. Bump this with each release.
 */
export const copyrightYear = 2026;
