import type { CategoryHandle, CollectionMeta } from "@/types/commerce";

/** Order matters: this is the horizontal nav on every collection page. */
export const collectionList: CollectionMeta[] = [
  {
    handle: "women",
    title: "Women's Clothing",
    description:
      "Fluid cotton, quiet tailoring and knitwear built to layer. Cut in natural fibres, produced in short runs.",
  },
  {
    handle: "men",
    title: "Men's Clothing",
    description:
      "Softly structured shirting, dry wool trousers and outerwear that works over everything already in the wardrobe.",
  },
  {
    handle: "knitwear",
    title: "Knitwear",
    description:
      "Extra-fine merino and cashmere blends, knitted in small mills and finished by hand.",
  },
  {
    handle: "shirts",
    title: "Shirts",
    description:
      "Cotton poplin and oxford, cut with room to move. The collars are constructed to hold their roll.",
  },
  {
    handle: "trousers",
    title: "Trousers",
    description:
      "Washed linen, tropical wool and rigid denim — high rises and clean, straight legs.",
  },
  {
    handle: "outerwear",
    title: "Outerwear",
    description:
      "Trench coats, blazers and leather, cut unlined where it makes them lighter to wear.",
  },
  {
    handle: "accessories",
    title: "Accessories",
    description:
      "Leather, suede and wool, made in small workshops we can name.",
  },
];

const byHandle = new Map(collectionList.map((entry) => [entry.handle, entry]));

export function getCollectionMeta(handle: string): CollectionMeta | null {
  return byHandle.get(handle as CategoryHandle) ?? null;
}
