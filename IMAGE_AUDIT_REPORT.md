# Image Audit Report (round 2)

Date: 2026-10-24 · 25 products · verification: rendered product pages in Chromium, not code paths.

## Libraries that actually worked

| Library | Access | Used |
|---|---|---|
| **Burst by Shopify** | search page + `burst.shopifycdn.com` direct | **yes — 9 frames installed this round** |
| Pexels | search via fetch tool, `images.pexels.com` direct | round 1 only |
| Unsplash | search 401, API needs a key | no |
| Pixabay | 403 | no |

Burst is the library the catalogue already used, so light and palette match without grading.

## The five problem areas

### 1. Canvas Weekender Bag — **FIXED**

| | |
|---|---|
| Before | Woman in a straw hat; no bag in frame |
| After | `weekender-bag-leather.jpg` + `weekender-bag-held.jpg` — a duffel held by both handles, whole bag in frame |
| Source | Burst `man-clutching-his-leather-duffle-bag`, `man-holding-his-leather-travel-bag` |
| Verified | rendered at 1440 px: bag occupies the frame, handles and silhouette clear |
| Not exact | The bag photographed is **leather, brown**; the product is canvas in Sand. Marked representative |

### 2. Linen Wide-Leg Trouser — **FIXED (category)**

| | |
|---|---|
| Before | Denim jacket and boots |
| After | `linen-trouser-khaki.jpg` — model in khaki wide-leg trousers, waist to hem |
| Source | Burst `a-model-in-khaki-trousers-and-a-striped-t-shirt` |
| Verified | trousers visible head-to-toe, neutral wall, khaki reads as the Stone colourway |
| Caveat | Model is seated, so the hem drapes rather than hangs |

### 3. Two colourways, one image — **NOT FIXED**

Six products still show one frame for two swatches: `silk-blend-slip-dress`,
`pleated-wool-trouser`, `quilted-liner-jacket`, `leather-derby`, `merino-scarf`,
`ribbed-wool-beanie`. Neither reachable library has the same garment in two colours, and
colour-shifting a photo would be faking product photography. **0 of 6 resolved.**

### 4. Pleated Wool Trouser — **PARTIAL**

| | |
|---|---|
| Before | Teal wall (`wool-trouser-cream.jpg`, Pexels) |
| After | `wool-trouser-grey.jpg` — dark neutral backdrop, full-length trousers |
| Source | Burst `a-model-in-summer-fashion-with-grey-backdrop` |
| Fixed | The teal wall is gone |
| New problem | It is the **same khaki outfit** as the linen trouser, shot standing. Two products, one garment |

### 5. Duplicated Burst frames — **FIXED for knit and denim**

| Cluster | Before | After |
|---|---|---|
| Knit | `knitWoman` + `knitPortrait` shared by cardigan, crew knit, sweater (2 keys × 3 products) | Cardigan → cream knit (worn + collar detail); crew knit → grey crew; sweater keeps its original pair, now used by nothing else. **3 distinct products** |
| Denim | `denimRailing` + `bootsCurb` shared by chore jacket and straight-leg denim | Chore jacket keeps the two jacket frames; straight-leg denim → `denim-jeans-detail` (waist and pocket macro). **No shared key** |

## Repo-wide shared frames after this round

| Key | Products |
|---|---|
| `coatForm` | tailored blazer, trench, wool overcoat (3) |
| `teeRailWhite` | three tees (3) |
| `blackJacket` | leather moto, quilted liner (2) |
| `derbyShoes` | leather derby, chelsea boot (2) |
| `greyShirt` | two poplin shirts (2) |
| `poplinMan` | two shirts (2) |
| `teeRailGrey` | two tees (2) |

Out of scope for the five-item brief, but it is the same class of problem and is listed rather
than hidden.

## Matching rate

| Measure | Round 1 | Round 2 |
|---|---|---|
| Right category in primary frame | 23 / 25 | **25 / 25** |
| Full garment silhouette in frame | 21 / 25 | **24 / 25** (beanie is a flat lay) |
| Colourway matched by photography | 14 / 25 | 14 / 25 (unchanged) |
| Products sharing a primary key with another product | 9 | **6** |

## Commands run

| Command | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx vitest run` | 116 / 116 |
| `npm run build` | pass |
| `npx playwright test` | 34 / 34 (desktop + mobile, includes 375 px overflow) |
| Rendered inspection | 7 product pages captured and reviewed image by image |

## Still open

1. Colour-specific photography for 6 products (item 3 above).
2. Pleated wool trouser and linen trouser photograph the same outfit.
3. Seven non-knit/non-denim frames remain shared (table above).
4. Bag and trousers are representative of material, not exact SKUs.
