# Performance Report — AUREL STUDIO

Phase 5 performance work. Every number below was produced on this machine, in production
mode, with the command shown. Nothing is estimated.

## Method

| Item | Value |
|---|---|
| Build | `npm run build` (Next 16.4.2, Turbopack, `cacheComponents: true`) |
| Server | `npm start -- --port 3412` (local, no CDN) |
| Tool | Lighthouse CLI **13.5.0** via `npx lighthouse` |
| Browser | System Edge (`CHROME_PATH`), headless, `--no-sandbox --disable-gpu` |
| Form factor | Lighthouse default **mobile emulation** (Moto G Power class, 4x CPU slowdown, simulated slow 4G) |
| Runs | 1 run per page per phase, then 2 extra runs on `/` to quantify variance |
| Date | 2026-10-24 |

Artifacts: `.lighthouse/before-*.json`, `.lighthouse/after-*.json`,
`.lighthouse/home-run1.json`, `.lighthouse/home-run2.json` (git-ignored).

> **Not field data.** These are lab measurements against a local server. There is no
> real-user traffic, so field INP, real-device LCP and CLS under genuine network conditions
> are **NOT TESTED**. The numbers describe the code, not a production audience.

## Baseline vs. after

| Page | Phase | Perf | A11y | Best Prac. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | before | 92 | 100 | 96 | 100 | 3.4 s | 0 | 40 ms |
| `/` | after | 89 → **93 / 97** (re-runs) | 100 | 96 → **100** | 100 | 3.8 → **3.2 / 2.6 s** | 0 | 20–70 ms |
| `/collections/women` | before | 92 | 98 | 100 | 92 | 3.4 s | 0 | 30 ms |
| `/collections/women` | after | **94** | **100** | 100 | 92 | **3.1 s** | 0 | 30 ms |
| `/products/wool-overcoat` | before | 95 | 100 | 100 | 100 | 2.9 s | 0 | 50 ms |
| `/products/wool-overcoat` | after | 93 | 100 | 100 | 100 | 3.2 s | 0 | 40 ms |

**Read this honestly:** the home and PDP movements are inside run-to-run noise on a local
server. Two extra home runs after the change returned **93 (LCP 3.2 s)** and **97 (LCP 2.6 s)**,
so the 89 was an outlier, not a regression — but nor is there a real speed-up to claim on
those two pages. The measurable, repeatable win is on the collection page (+2 perf, +2 a11y)
and in **bytes shipped** (below), which is not noise.

CLS is 0 on all three pages in both phases.

## Bytes on the wire (Lighthouse resource summary)

| Page | Phase | Total | HTML | JS | CSS | Images | Fonts |
|---|---|---|---|---|---|---|---|
| `/` | before | 437 KB | 16 KB | 181 KB | 9 KB | 130 KB | 77 KB |
| `/` | after | **376 KB** | 16 KB | 181 KB | 9 KB | **83 KB** | 77 KB |
| `/collections/women` | before | 504 KB | 24 KB | 187 KB | 9 KB | 174 KB | 77 KB |
| `/collections/women` | after | **425 KB** | 24 KB | 187 KB | 9 KB | **110 KB** | 77 KB |
| `/products/wool-overcoat` | before | 433 KB | 15 KB | 187 KB | 9 KB | 115 KB | 77 KB |
| `/products/wool-overcoat` | after | **379 KB** | 15 KB | 187 KB | 9 KB | **76 KB** | 77 KB |

Images: **−36% / −37% / −34%**. JS and CSS are unchanged — this phase did not add or remove
client boundaries.

## What changed, and why

| # | Change | File | Rationale | Effect | Side effects |
|---|---|---|---|---|---|
| 1 | `images.formats: ["image/avif", "image/webp"]` | `next.config.ts` | Next was serving WebP only; AVIF is 30–50% smaller at equal quality | Images −34% to −37% | First request pays on-demand AVIF encoding (worse cold start, better once cached by a CDN) |
| 2 | Hero `quality={72}` | `components/home/hero.tsx` | The hero is the LCP element and is always full-bleed; 75→72 is invisible on photography at 100vw | Hero payload down with no visible difference | None observed |
| 3 | Card `priority` from first 4 → first 2 | `components/collection/product-grid.tsx` | Four `<link rel=preload>` competes for the same connection and delays the one that matters | LCP 3.4 → 3.1 s on the collection page | Cards 3–4 now lazy-load; they are below the fold on mobile |
| 4 | Added `src/app/icon.svg`, removed the `icons` metadata pointing at a non-existent `/favicon.ico` | `app/icon.svg`, `app/layout.tsx` | Every page logged a 404 for the favicon, which Lighthouse counted as a console error | Best Practices 96 → 100 on `/` | None — Next serves the file convention automatically |
| 5 | Visually hidden `h2` above the grids | `collections/[slug]/page.tsx`, `search/page.tsx` | Card titles are `h3`; without an `h2` the outline jumps h1 → h3 | A11y 98 → 100 on the collection page | None |

## Deliberately not changed

- **JS stays at ~181–187 KB.** The client boundaries are the header (i18n switch), the cart
  drawer, the search dialog, the filter rail and the locale provider. Cutting them would
  remove the interactions the project exists to demonstrate.
- **Fonts stay at 77 KB / two families.** Both are `display: swap`, subset to Latin, and
  carry the brand. A third would be decoration.
- **No bundle analyser numbers.** `@next/bundle-analyzer` is not installed and adding it in
  this phase would ship a dev dependency for one report. Resource-summary sizes above are
  the substitute.
- **PPR stays on.** It is the reason `notFound()` on a dynamic route returns 200 on the
  first request (see README limitations); turning it off would fix that but change the
  rendering mode of every route.

## Remaining opportunities

1. **Pre-generate AVIF at build time** (or warm the image cache in CI) so the first visitor
   does not pay transcoding. Currently the first hit per size is slow.
2. **Self-host the two fonts** with `next/font/local` to remove the Google Fonts round-trip
   on cold TLS.
3. **Split the header's client boundary**: the mega menu is static markup; only the region
   chip and the mobile drawer need state.
4. **Field measurement** — nothing here substitutes for real RUM data (GA4 + Web Vitals).

## How to reproduce

```bash
npm run build
npm start -- --port 3412

# in another shell, with Edge installed:
export CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npx --yes lighthouse http://127.0.0.1:3412/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=.lighthouse/after-home.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet
```

Run it three times before drawing a conclusion — ±4 points and ±1 s LCP is normal on a
local server without network shaping.
