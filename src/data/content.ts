/**
 * Static editorial and client-care pages.
 *
 * These exist because the navigation and footer link to them. The copy is
 * deliberately honest about what this project is: a portfolio storefront with no
 * fulfilment, no payment and no customer service desk. Nothing here promises a
 * delivery, a returns address or a certified policy.
 */

export interface ContentSection {
  heading: string;
  body: string[];
}

export interface ContentPage {
  slug: string;
  title: string;
  intro: string;
  sections: ContentSection[];
}

const pages: ContentPage[] = [
  {
    slug: "journal",
    title: "The Atelier Notes",
    intro:
      "Notes from a small studio: how a piece starts, why the collection grows slowly, and what we keep once a season ends.",
    sections: [
      {
        heading: "On making fewer things, properly",
        body: [
          "Every piece starts on the stand, not on a screen. We cut the pattern, wear it for a season, then cut it again. That is why the collection grows slowly — and why a piece that enters it tends to stay.",
          "We work with two mills and one workshop. Small runs mean we can change a collar in a week rather than a year, and it means we sell out of a size rather than discount it.",
        ],
      },
      {
        heading: "What the collection is for",
        body: [
          "Clothes that survive a change of job, city or weather. Natural fibres where they make sense, synthetic only where they perform better, and nothing that needs special handling to look like itself.",
          "If a piece does not earn its place across two seasons, it does not go into the next one.",
        ],
      },
      {
        heading: "About this demo",
        body: [
          "AUREL STUDIO is a portfolio project. The studio, the collection and the copy are fictional; the photography is licensed stock. No orders can be placed.",
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping",
    intro:
      "How delivery works in a real store, and what this demo actually supports.",
    sections: [
      {
        heading: "Delivery",
        body: [
          "In a live store this page would list the carriers, cut-off times, tracked and untracked services, and the estimated transit window for each region.",
          "This demo does not ship anything. No order can be placed, so no parcel exists.",
        ],
      },
      {
        heading: "Complimentary shipping",
        body: [
          "The bag shows a free-shipping threshold so the progress indicator has something real to calculate against. It is a demonstration threshold: it is not a delivery promise and no carrier is attached to it.",
        ],
      },
      {
        heading: "Duties and taxes",
        body: [
          "Cross-border pricing usually splits into DDP (duties paid at checkout) and DDU (paid on delivery). This project does not implement either. The region selector changes display currency only.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns",
    intro: "The returns policy a store like this would publish — and what is not implemented here.",
    sections: [
      {
        heading: "The intended policy",
        body: [
          "Unworn pieces with tags attached, returned within 30 days of delivery, refunded to the original payment method. Sale pieces final.",
          "None of that is enforceable in this demo because nothing can be bought. The policy is written here as product copy, not as a service commitment.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "In practice most customers want a different size rather than a refund. A live store would offer a prepaid exchange label and hold the replacement for a fixed window.",
        ],
      },
    ],
  },
  {
    slug: "faq",
    title: "Questions",
    intro: "Sizing, care and how the catalogue is put together.",
    sections: [
      {
        heading: "How do I choose a size?",
        body: [
          "Every product page has a size guide with flat measurements in centimetres, plus a note on whether that piece runs close or relaxed.",
          "Between sizes: take the smaller one for knitwear, the larger one for outerwear.",
        ],
      },
      {
        heading: "How should I care for natural fibres?",
        body: [
          "Cold water, no tumble dryer, dry flat. Wool and cashmere pill where they rub; a comb removes it and the piece settles after two or three wears.",
          "Each product page lists care instructions specific to its material.",
        ],
      },
      {
        heading: "Is stock live?",
        body: [
          "Yes — within this catalogue. Inventory is tracked per SKU, so a size that shows as sold out cannot be added to the bag.",
        ],
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    intro: "Where to write in a real store, and why there is no inbox behind this one.",
    sections: [
      {
        heading: "Client care",
        body: [
          "A live studio would publish an address, a response window and a separate route for wholesale and press. This demo has no inbox, so nothing sent here would be read.",
        ],
      },
      {
        heading: "About the build",
        body: [
          "AUREL STUDIO is a front-end portfolio project built with Next.js, React and Tailwind. The catalogue, cart, wishlist, search and SEO layer are all functional in the browser; the back office is not part of it.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy",
    intro: "What this site stores, and where.",
    sections: [
      {
        heading: "What is stored",
        body: [
          "Three things, all in your browser's local storage: the bag, the wishlist, and your display preferences (currency, region, language). Nothing is sent to a server.",
          "Clearing site data removes all three. There is no account and no analytics script on this deployment.",
        ],
      },
      {
        heading: "What a live store would add",
        body: [
          "Order history, a payment processor, a consent record and a data-retention policy. None of those exist here.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    intro: "The short version: this is a demonstration storefront.",
    sections: [
      {
        heading: "Use of this site",
        body: [
          "AUREL STUDIO is a portfolio demonstration. Prices, products, materials and policies are illustrative. Nothing on this site forms an offer to sell.",
        ],
      },
      {
        heading: "Content and photography",
        body: [
          "Brand and copy are original to this project. Photography is licensed stock, credited in the repository. No third-party brand assets are used.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies",
    intro: "No cookies are used. State lives in local storage.",
    sections: [
      {
        heading: "Why no cookies",
        body: [
          "The bag, wishlist and preferences are client-side state, so local storage does the job without a cookie banner. There is no session cookie because there is no session.",
        ],
      },
      {
        heading: "A live store",
        body: [
          "It would need a session cookie for checkout, a consent record for analytics, and a preference cookie for currency. This project has none of them.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    intro: "What has been done, and what is still missing.",
    sections: [
      {
        heading: "Implemented",
        body: [
          "Semantic landmarks and a skip link, visible focus rings, drawn focus states on custom controls, labelled icon buttons, `inert` on closed overlays, focus restored to the trigger on close, and text that clears WCAG AA contrast.",
          "Motion is optional: every transition is disabled under `prefers-reduced-motion`.",
        ],
      },
      {
        heading: "Known gaps",
        body: [
          "The catalogue has not been through a screen-reader audit across all pages, and there is no automated accessibility test in the pipeline yet. Both are on the roadmap.",
        ],
      },
    ],
  },
];

export const contentPages = pages;

export function getContentPage(slug: string): ContentPage | null {
  return pages.find((page) => page.slug === slug) ?? null;
}
