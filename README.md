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

**English is the only indexed language.** The German UI is a real, typed translation of the
interface (not a label swap), but it has no URLs of its own — so there is no `hreflang`
anywhere. Faking alternate URLs for a language without pages would be a lie to crawlers.
English stays in the SSR markup; the German switch applies after hydration and updates
`<html lang>` on the client.

**Canonical is per page, never in the root layout.** A root canonical would make every
product claim to be the homepage. Collection views always canonicalise to the unfiltered
path and mark themselves `noindex`.

**Structured data only uses fields that exist.** One `Product` with an `Offer` per real
variant (SKU, price, availability). No `aggregateRating`, `review`, `gtin`, `shippingDetails`
or `priceValidUntil` — inventing them would be worse than having no rich result.

**Robots does not hide the noindex pages.** `/cart`, `/wishlist` and `/search` are crawlable
so the `noindex` meta is readable; `Disallow` would hide them without ever removing them.

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
- **404 status codes.** With Cache Components (PPR), `notFound()` inside a dynamic route
  streams the 404 page with HTTP 200. Static unknown routes still return 404.
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
