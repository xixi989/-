# Image Audit Report

Date: 2026-10-24 · Catalogue: 25 products / 217 SKUs · Images reviewed: 29 files in
`public/images/` (23 Burst catalogue frames + 6 category/editorial frames), plus 4 new Pexels
frames installed this pass.

## Method and its limits

1. Every product's `photos` mapping in `src/data/catalog.ts` was read against its title, its
   category and its colourways.
2. Candidate replacements were downloaded from Pexels and **looked at** — first as a
   contact-sheet of 12 candidates, then as rendered 3:4 crops from the actual product pages.
   Judgements below are about what the images show, not about their filenames.
3. `pexels.com` search pages return 403 to `curl` in this environment but are reachable
   through the fetch tool; `images.pexels.com` serves files directly. Unsplash and Pixabay
   search pages returned 401/403, and their APIs require keys that this project does not have.
   **So the only library actually searched was Pexels.**
4. No automated scraping: 4 search pages were read by hand and 12 candidates downloaded for
   review. Rejected candidates are listed in `IMAGE_ASSET_MANIFEST.md`.

## What changed

| Product | Before | After | Verdict |
|---|---|---|---|
| Ribbed Wool Beanie | Wide-brim **felt hat** | Two knit beanies (black + oat); second frame worn on a street | **Fixed** — category now correct |
| Pleated Wool Trouser | Leather **shoes only** | Full-length cream wide-leg trousers on a model | **Fixed** — garment visible, colour representative |
| Merino Scarf | Studio portrait, **no scarf** | Grey scarf worn close to the neck | **Fixed** — category and material read clearly |
| Canvas Weekender Bag | Woman in a straw hat, no bag | *(reverted)* woman in a straw hat, no bag | **Not fixed** — see below |
| Linen Wide-Leg Trouser | Denim + boots | *(reverted)* denim + boots | **Not fixed** — see below |

## Why two products were reverted

Both candidates were real, correctly-licensed photographs of the right object, and both failed
the same test: the frame.

- **5120082 (duffel bag)** is a close-up of a bag's top — handles and zip fill the frame. On a
  3:4 card the product is cut in half. A bag you cannot see whole is worse than an honest gap.
- **6996128 (linen outfit)** is a body close-up on a couch — no full trouser silhouette.

They were installed, rendered on the real product pages, inspected, and removed. The catalogue
still lists both products in `PHOTO_PENDING` with the specific reason.

## Matching rate

Counting *category* agreement only (does the primary frame show the named kind of garment):

| Measure | Before | After |
|---|---|---|
| Products whose primary frame shows the right category | 20 / 25 (80%) | **23 / 25 (92%)** |
| Products with a full garment silhouette in frame | 18 / 25 | **21 / 25** |
| Products using a frame that also matches the colourway | 14 / 25 | **14 / 25** (unchanged — the three new frames are colour-representative only) |
| Files reviewed | 23 | 29 |

Colour fidelity did **not** improve. Stock libraries rarely have the same garment in two
colourways, and this pass would not fake it with filters. On the three replaced products the
same frame is used for both colourways; that is disclosed here and in the manifest.

## Visual quality

- All four new files are 1200 × 1600 at source, saved under 400 KB each, and served through
  `next/image` as AVIF/WebP. None is upscaled or sharpened.
- The new frames sit closer to the brand's palette than what they replaced (oat knit, grey
  knit, cream wool), with one exception: the trouser frame has a **teal wall** behind the
  model, which is the least on-brand element now on the site.
- No watermarks, logos or third-party trademarks appear in any installed frame.

## Unresolved

| # | Issue | Status |
|---|---|---|
| 1 | Canvas Weekender Bag still shows no bag | Pending real photography |
| 2 | Linen Wide-Leg Trouser still shows denim | Pending real photography |
| 3 | Three replaced products use one frame for two colourways | Documented; needs colour-specific shoots |
| 4 | Teal background on the pleated trouser frame | Cosmetic, accepted |
| 5 | Unsplash / Pixabay not searched (401/403 + no API key) | Environmental limit |
| 6 | Five Burst frames remain shared across categories (knitwear ×3, denim ×2) | Out of scope for this pass |

## What would close this properly

One half-day shoot, 12 frames, neutral ground, 3:4: bag (whole object, both angles), linen
trouser (full length), wool trouser (charcoal), beanie (charcoal + oat), scarf (bone +
graphite). That is the only way items 1–4 stop being caveats.

## Verification run after the changes

| Command | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx vitest run` | 116 / 116 (includes the title↔alt category test, now stricter: two fewer exemptions) |
| `npm run build` | pass |
| Product pages rendered and inspected | beanie / trouser / scarf confirmed at 3:4; bag + linen reverted |
