# AUREL STUDIO

A modern essentials clothing brand storefront — headless-commerce architecture, editorial
art direction. Built as a portfolio project for front-end / cross-border DTC roles.

**Phase 4 (this commit): cross-border presentation and technical SEO** — display currency,
region selector, English/German interface, metadata, JSON-LD, sitemap and robots. Payment
and real multi-currency settlement are still out of scope; see [Roadmap](#roadmap).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, TypeScript strict |
| Styling | Tailwind CSS 4 (CSS-first `@theme` tokens) |
| State | Zustand — cart, wishlist, overlays, display preferences (all localStorage) |
| i18n | In-house dictionaries + typed keys (no runtime library) |
| Money | Integer minor units, `Intl.NumberFormat`, demo FX table |
| Tests | Vitest — 113 unit tests |

## Run it

```bash
npm install
cp .env.example .env.local   # then set SITE_URL
npm run dev                  # http://localhost:3000
```

```bash
npm run build      # production build
npm start
npm run typecheck  # tsc --noEmit
npm run lint       # eslint --max-warnings=0
npm test           # vitest run
```

### Environment

| Variable | Meaning |
|---|---|
| `SITE_URL` | Absolute origin, no trailing slash. Powers canonical, OG URLs and `sitemap.xml`. **Empty = no absolute URLs at all** — the build never falls back to localhost or an invented domain. |
| `SEO_INDEXING` | `"true"` only when the deployment should be discoverable. Anything else emits `robots.txt` with `Disallow: /` and site-wide `noindex`. Default is closed. |

`.env.local` is git-ignored; `.env.example` documents both. A local demo can set
`SITE_URL=http://localhost:3000` and `SEO_INDEXING=true` to see the full tag output.

## Routes

| Route | Indexing |
|---|---|
| `/` | indexable, canonical `/` |
| `/collections/[slug]` | indexable; **filtered/sorted views are `noindex` with a canonical back to the clean URL** |
| `/products/[slug]` | indexable, canonical + product OG image + JSON-LD |
| `/cart` | `noindex, nofollow` |
| `/wishlist` | `noindex` |
| `/search?q=` | `noindex` |

## Design decisions worth knowing

**Money has one source of truth.** The catalogue is priced in USD minor units and is never
mutated. `lib/commerce/currency.ts` converts once (`Math.round`) and formats once; a fixed
demo rate table is the only place to swap for a live feed. Cart totals are converted from
the **USD total**, not summed from converted lines, so rounding cannot make the summary
disagree with itself.

**Display currency is not settlement currency.** Prices convert; offers do not. Every
converted block sits near a notice saying the rate is a demonstration figure, and JSON-LD
publishes `priceCurrency: "USD"` regardless of what the shopper is viewing.

**Region is a preference, not a promise.** Choosing Germany changes the label and the
suggested currency. It does not claim local stock, local shipping, duty handling or local
payment, and the dialog says so.

**English is the only indexed language — German is a UI preview.** The German strings are a
real, typed translation of the interface (navigation, footer, filters, product actions, cart,
wishlist, search, region dialog), and prices reformat to German conventions (`118,50 £`). But
there is no `/de` route: the language lives in local storage, applies after hydration and
updates `<html lang>` on the client. Because no German URL exists, the site emits no
`hreflang` — announcing a German alternate for a page that has no German URL would be a lie
to crawlers. A real German launch needs `app/[locale]` plus server-side dictionaries; the
typed dictionary and the switch already exist, only the routing layer is missing. The region
dialog says this in plain language.

**Canonical is per page, never in the root layout.** A root canonical would make every
product claim to be the homepage. Collection views always canonicalise to the unfiltered
path and mark themselves `noindex`.

**Structured data only uses fields that exist.** One `Product` with an `Offer` per real
variant (SKU, price, availability). No `aggregateRating`, `review`, `gtin`, `shippingDetails`
or `priceValidUntil` — inventing them would be worse than having no rich result.

**Robots does not hide the noindex pages.** `/cart`, `/wishlist` and `/search` are crawlable
so the `noindex` meta is readable; `Disallow` would hide them without ever removing them.

## QA pass (post-phase-4)

An external audit raised 8 P2 findings. All were re-checked against the code first; none had
been fixed already. Current state:

| ID | Issue | State |
|---|---|---|
| P2-01 | Product photography not matching the product | **Partial** — 4 mappings corrected, 5 documented in `PRODUCT_IMAGE_AUDIT.md`, regression test added |
| P2-02 | Currency not applied to copy (`$150`, `Under $100`) | **Fixed** — every amount goes through `useFormatUsdCents` |
| P2-03 | Search dialog prices stuck in USD | **Fixed** |
| P2-04 | Wishlist `getServerSnapshot` infinite-loop warning | **Fixed** — stable module-level empty array |
| P2-05 | German coverage gaps + `€66.24` formatting | **Fixed** — nav, footer, filters, search, PDP, aria-labels, `de-DE` numbers |
| P2-06 | No `/de` routes | **Documented** — German is a UI preview; stated in the region dialog and here. Routing deferred rather than faked |
| P2-07 | 10 dead links | **Fixed** — 9 content pages built (`/journal`, `/shipping`, `/returns`, `/faq`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/accessibility`); `/account` removed from the mobile menu |
| P2-08 | Soft 404 + conflicting robots on the 404 page | **Partial** — robots conflict fixed, HTTP status documented as a PPR limitation |

## QA pass (post-phase-4)

An external audit raised 8 P2 findings. All were re-checked against the code first; none had
been fixed already. Current state:

| ID | Issue | State |
|---|---|---|
| P2-01 | Product photography not matching the product | **Partial** — 4 mappings corrected, 5 documented in `PRODUCT_IMAGE_AUDIT.md`, regression test added |
| P2-02 | Currency not applied to copy (`$150`, `Under $100`) | **Fixed** — every amount goes through `useFormatUsdCents` |
| P2-03 | Search dialog prices stuck in USD | **Fixed** |
| P2-04 | Wishlist `getServerSnapshot` infinite-loop warning | **Fixed** — stable module-level empty array |
| P2-05 | German coverage gaps + `€66.24` formatting | **Fixed** — nav, footer, filters, search, PDP, aria-labels, `de-DE` numbers |
| P2-06 | No `/de` routes | **Documented** — German is a UI preview; stated in the region dialog and here. Routing deferred rather than faked |
| P2-07 | 10 dead links | **Fixed** — 9 content pages built (`/journal`, `/shipping`, `/returns`, `/faq`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/accessibility`); `/account` removed from the mobile menu |
| P2-08 | Soft 404 + conflicting robots on the 404 page | **Partial** — robots conflict fixed, HTTP status documented as a PPR limitation |

## Verification (actually run)

| Command | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` | clean (`--max-warnings=0`) |
| `npm test` | 113 passed / 113 |
| `npm run build` | all routes incl. `robots.txt`, `sitemap.xml` |
| HTML-source SEO audit (35 checks) | 35 / 35 |
| Browser currency/i18n audit (20 checks) | 20 / 20 |

The source audit parses the served HTML (not the hydrated DOM): titles, descriptions,
canonical, OG/Twitter, `noindex` placement, JSON-LD offers and prices, sitemap contents,
robots directives, 404 status. The browser audit switches to the UK, checks `£56.88` for a
`$72` piece, reloads, adds to bag, switches to German, and confirms the cart survives,
JSON-LD stays in USD and nothing overflows at 375px.

## Known limitations

- **No checkout, therefore no multi-currency settlement.** EUR/GBP are display conversions
  only. As a result this does not meet Google Merchant Listing eligibility on its own: JSON-LD
  is technically valid but the shop cannot take an order.
- **No `hreflang`** — there is no second indexable language (see above).
- **Product copy stays English.** Titles, descriptions, materials and care text are
  merchandising content; only interface strings are translated.
- **Variant URLs.** Colour/size are client state, not URL parameters, so one `Product` with
  an offer list is used instead of `ProductGroup`/`hasVariant`.
- **404 status codes.** With Cache Components (PPR), the first request for an unknown
  `/products/` or `/collections/` slug streams the shell with HTTP 200 and the 404 body; the
  second request returns 404 from cache. `export const dynamic` and `dynamicParams` are both
  rejected by `cacheComponents`, and `instant = false` does not change the first status, so
  this is left as a documented trade-off of PPR rather than papered over. The 404 page's
  contradictory robots tags *were* fixed: it now emits a single `noindex`.
- **Photography** is free stock (Burst by Shopify), disclosed in `public/images/CREDITS.md`.
- **Footer info pages** (`/shipping`, `/faq`, …) are linked but not built.

## Roadmap

| Phase | Scope |
|---|---|
| 1 ✅ | Setup, design system, homepage |
| 2 ✅ | Catalogue, collection filters/sort, PDP with variants |
| 3 ✅ | Cart drawer + cart page, wishlist, search |
| 4 ✅ | Multi-currency, region selector, i18n, SEO, JSON-LD, sitemap/robots |
| 5 | Demo checkout, GA4 e-commerce events, Playwright e2e |
| 6 | Deploy, portfolio write-up |
