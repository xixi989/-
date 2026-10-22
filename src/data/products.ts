import type { CollectionEntry } from "@/types/commerce";

/**
 * Editorial entries for the homepage. Products themselves live in
 * `data/catalog.ts` and are read through the commerce adapter.
 */
export const collectionEntries: [CollectionEntry, CollectionEntry] = [
  {
    handle: "women",
    eyebrow: "01 — Women",
    title: "Women's Collection",
    description:
      "Fluid cotton, quiet tailoring and pieces that layer without effort.",
    href: "/collections/women",
    image: {
      src: "/images/hero-women.jpg",
      alt: "Woman in a white cotton tee and shorts beside a sunlit window",
      objectPosition: "52% 6%",
    },
  },
  {
    handle: "men",
    eyebrow: "02 — Men",
    title: "Men's Collection",
    description:
      "Softly structured shirts and relaxed knitwear, cut for everyday wear.",
    href: "/collections/men",
    image: {
      src: "/images/category-men.jpg",
      alt: "Man in a loose cotton shirt in a bright concrete interior",
      objectPosition: "50% 22%",
    },
  },
];
