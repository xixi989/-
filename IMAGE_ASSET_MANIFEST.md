# Image Asset Manifest

New photography added in the asset pass of 2026-10-24. Existing Burst by Shopify
photography is documented separately in `public/images/CREDITS.md`.

**Source and licence for every new file:** Pexels, under the
[Pexels licence](https://www.pexels.com/license/) — free for commercial and non-commercial use,
attribution not required, no selling unmodified copies, and no implying that the people or
brands shown endorse this project. Files are self-hosted; nothing is hotlinked.

**Processing applied to all four:** fetched from the Pexels CDN with
`?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1600`, i.e. cropped server-side to 3:4 to match
the product card and gallery frame. No colour grading, sharpening or upscaling was applied.

| Local file | Used for | Source page | Photographer | Licence | Downloaded | Crop | Representative? |
|---|---|---|---|---|---|---|---|
| `public/images/catalog/knit-beanie-oat.jpg` | Ribbed Wool Beanie — primary | [cozy-knitted-winter-hats-on-wooden-surface-37484033](https://www.pexels.com/photo/cozy-knitted-winter-hats-on-wooden-surface-37484033/) | Lee Hanson | Pexels licence | 2026-10-24 | 3:4 centre | **Yes** — two beanies (black + oat) on a blush surface; the frame is used for both colourways |
| `public/images/catalog/knit-beanie-worn.jpg` | Ribbed Wool Beanie — second frame | [woman-in-knitted-beanie-on-city-street-40340508](https://www.pexels.com/photo/woman-in-knitted-beanie-on-city-street-40340508/) | Ines Pavao | Pexels licence | 2026-10-24 | 3:4 centre | **Yes** — beanie worn, street context |
| `public/images/catalog/wool-trouser-cream.jpg` | Pleated Wool Trouser — both colourways | [brunette-woman-posing-in-white-outfit-21768392](https://www.pexels.com/photo/brunette-woman-posing-in-white-outfit-21768392/) | not stated on the search page | Pexels licence | 2026-10-24 | 3:4 centre | **Yes** — cream wide-leg trousers; product colourways are Charcoal and Stone, so the colour is not matched |
| `public/images/catalog/merino-scarf-grey.jpg` | Merino Scarf — both colourways | [person-wearing-a-sweater-and-a-scarf-6630873](https://www.pexels.com/photo/person-wearing-a-sweater-and-a-scarf-6630873/) | Polina Tankilevitch | Pexels licence | 2026-10-24 | 3:4 centre | **Yes** — grey scarf worn close to the neck; colourways are Bone and Graphite |

## What "representative" means here

The item is the right *category* and reads correctly on a product page, but it is not
photography of the actual SKU:

- garment colour does not always match the selected colourway;
- the same frame is used for two colourways where no colour-specific frame exists;
- the garment is not the exact cut described in the copy.

Nothing in this project claims otherwise. `IMAGE_AUDIT_REPORT.md` records the same facts, and
the catalogue test enforces category agreement between the title and the alt text.

## Removed during this pass

| File | Reason |
|---|---|
| `weekender-bag-studio.jpg` (Pexels 5120082) | The source is a close-up of a bag's top; at 3:4 the frame cuts the bag in half |
| `linen-trouser-wide-leg.jpg` (Pexels 6996128) | Body close-up, no full trouser silhouette |

Both products were returned to their previous frames and re-listed in `PHOTO_PENDING` in
`src/data/catalog.ts`. The files were deleted rather than left orphaned.

## Candidates reviewed and rejected

Downloaded, viewed in a contact sheet, and not used:

| Pexels ID | Why rejected |
|---|---|
| 13872590 | Bag on the ground at night — too dark, subject unreadable |
| 27793087 | Red duffel bag — colour clashes with the brand palette |
| 9563714 | Red/yellow scarf — oversaturated |
| 10947222 | Scarf in snow — subject buried under winter styling |
| 15490507 | Knit hat portrait — a face shot, not a garment frame |
| 11630887 | Blue knit cap — blue is off-palette |
