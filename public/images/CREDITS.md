# Image credits

All photography on this site comes from **Burst by Shopify** (https://burst.shopify.com),
released under the Burst free licence: free for commercial and non-commercial use,
no attribution required. Images are self-hosted in `/public/images` so the site has
no runtime dependency on a third-party CDN and no hotlinking.

| File | Source photo |
|---|---|
| `hero-women.jpg` | `woman-dressed-in-white-leans-against-a-wall` |
| `category-men.jpg` | `mens-fashion-loose-cotton-shirt` |
| `editorial-coat.jpg` | `slow-fashion-coat` |
| `editorial-form-wide.jpg` | `slow-fashion-dress-from` |
| `product-tee-man.jpg` | `person-in-a-white-shirt-sits-in-front-of-a-brick-wall` |
| `product-tees-rail.jpg` | `tshirts` |
| `product-tees-light.jpg` | `womens-tshirts` |

No brand logos, campaign imagery or copy from COS, ARKET, ZARA or any other label
appears in this project. The products, names, prices and copy are invented for a
portfolio demonstration.

## Replacing an image

Keep the same filename and a 3:4 portrait crop for product and collection slots;
the hero tolerates any landscape-ish ratio because it is `object-cover` with an
explicit focal point (`objectPosition` in `src/data/products.ts`, or the inline
style in `hero.tsx` / `editorial-band.tsx`).

## Added in the phase-6 asset pass (2026-10-24)

Four product frames come from **Pexels** under the
[Pexels licence](https://www.pexels.com/license/): `knit-beanie-oat.jpg`,
`knit-beanie-worn.jpg`, `wool-trouser-cream.jpg`, `merino-scarf-grey.jpg`.
Per-file source pages, photographers, crops and the "representative stock" caveat are recorded
in [`IMAGE_ASSET_MANIFEST.md`](../../IMAGE_ASSET_MANIFEST.md) at the repository root.
