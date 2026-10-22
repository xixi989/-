# Product Image Audit

Audit of `src/data/catalog.ts` against `public/images/catalog/`.

**Context.** The catalogue was built on a free stock library (Burst by Shopify) because
commissioning 25 product shoots was out of scope. That library has 23 usable frames and no
photography at all for bags, linen trousers, beanies or scarves. This document records what
was fixed, what could not be, and what a real shoot would need to supply.

## Fixed in this pass

| Product | Was | Now | Why |
|---|---|---|---|
| Straw Bucket Hat | Felt wide-brim hat as primary | Straw hat frame primary, felt frame second | The straw frame was already in the library and shows the actual product |
| Pleated Wool Trouser | Leather shoes as primary | Jeans-and-boots frame primary, shoes second | A leg frame beats a footwear-only frame for a trouser |
| Quilted Liner Jacket | Leather jacket frame in gallery | Single zip-jacket frame | A leather biker jacket is a different product |
| Silk-Blend Slip Dress | Second frame was a knit top | Single dress frame for both colourways | One honest frame beats a second wrong one |

## Still pending — needs real photography

These five are listed in `PHOTO_PENDING` in `src/data/catalog.ts`, and `catalog.test.ts`
exempts exactly this list. Adding a product to the list without a reason fails the test.

| Product | What the page shows now | What is needed |
|---|---|---|
| Canvas Weekender Bag | Editorial frame of a woman in a straw hat and denim top — **no bag in frame** | One studio shot of the weekender on a neutral ground, plus a detail of the strap and zip |
| Linen Wide-Leg Trouser | Denim and boots at the curb | Full-length frame showing the wide leg and the drape of washed linen |
| Pleated Wool Trouser | Jeans and boots (leg frame only) | Frame showing the forward pleat and the taper over a shoe |
| Ribbed Wool Beanie | Wide-brim felt hat | Head-on frame of the knit beanie, showing the turn-up |
| Merino Scarf | Dark studio portrait, no scarf visible | Frame with the scarf draped or looped, showing both faces of the weave |

## Also thin (not flagged, but weak)

| Product | Issue |
|---|---|
| Wool-Cashmere Cardigan | Primary is a studio portrait; the knit reads as a texture study rather than a cardigan |
| Merino Crew Knit / Cotton-Cashmere Sweater | Two products share the same two knit frames — the library has no men's knitwear |
| Canvas Weekender Bag | Only one colourway exists, and it has no product frame at all |

## What is enforced now

`src/data/catalog.test.ts` → *photography shows the product*:

- Every product whose **title names a literal category** (Bag / Trouser / Hat / Beanie /
  Scarf / Boot / Derby / Dress) must have that word — or its plural — in the **primary
  image alt text**, unless it is in `PHOTO_PENDING`.
- Every entry in `PHOTO_PENDING` must exist in the catalogue, carry a written reason, and
  still ship an image (the gap is semantic, not missing).
- Every colourway must have at least one frame.

This does not prove the photograph is *correct* — only that the alt text and the title agree.
A semantic image check needs either a human editorial pass or a vision model over the library.

## Recommended next step

One shoot, 4 hours, 12 frames: bag (2), trouser (2), beanie (2), scarf (2), cardigan (2),
men's knit (2). That closes every pending item and removes the shared knit frames. Until
then the honest position is: **these five products show category-adjacent imagery, and the
site says so here rather than hiding it.**
