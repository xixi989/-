import type {
  CategoryHandle,
  Product,
  ProductColor,
  ProductImage,
  ProductVariant,
  SizeCode,
} from "@/types/commerce";
import { SIZE_CODES } from "@/types/commerce";

/**
 * Mock catalogue.
 *
 * Two rules keep this maintainable:
 * 1. Specs are compact and human-editable; SKUs, variants and stock are derived
 *    deterministically by `buildProduct`. No `Math.random()`, so builds and tests
 *    are stable.
 * 2. Photography is referenced by key from `PHOTO`, so a photo swap is one edit.
 */

const PHOTO = {
  teeBack: {
    src: "/images/catalog/back-of-mens-white-shirt.jpg",
    alt: "Back view of a white cotton tee on a model",
  },
  teeRailWhite: {
    src: "/images/catalog/tshirts.jpg",
    alt: "Cotton tees hanging on wooden hangers",
  },
  teeRailGrey: {
    src: "/images/catalog/womens-tshirts.jpg",
    alt: "Tees in neutral tones on a steel rail",
  },
  whiteTeeWoman: {
    src: "/images/catalog/woman-dressed-in-white-leans-against-a-wall.jpg",
    alt: "Woman in a white cotton tee beside a sunlit wall",
    objectPosition: "56% 20%",
  },
  whiteTeeMan: {
    src: "/images/catalog/person-in-a-white-shirt-sits-in-front-of-a-brick-wall.jpg",
    alt: "Man in a white tee seated against a brick wall",
  },
  poplinWoman: {
    src: "/images/catalog/young-woman-in-casual-fashion.jpg",
    alt: "Woman in a crisp white shirt against a tiled wall",
  },
  poplinMan: {
    src: "/images/catalog/professional-man-portrait.jpg",
    alt: "Man in a striped cotton shirt",
  },
  greyShirt: {
    src: "/images/catalog/back-of-mens-white-shirt.jpg",
    alt: "Cotton shirt seen from the back",
  },
  greenShirt: {
    src: "/images/catalog/mens-fashion-loose-cotton-shirt.jpg",
    alt: "Man in a loose cotton shirt",
  },
  denimRailing: {
    src: "/images/catalog/mens-fashion-stonewash-jeans-and-boots.jpg",
    alt: "Denim jacket worn over light wash jeans",
  },
  denimWoman: {
    src: "/images/catalog/woman-in-jean-jacket.jpg",
    alt: "Woman in a denim jacket",
  },
  bootsCurb: {
    src: "/images/catalog/brown-boots-on-the-curb.jpg",
    alt: "Suede boots and selvedge denim, seen at the curb",
  },
  derbyShoes: {
    src: "/images/catalog/mens-leather-dress-shoes.jpg",
    alt: "Polished leather derby shoes",
  },
  coatForm: {
    src: "/images/catalog/slow-fashion-coat.jpg",
    alt: "Wool coat pinned on an atelier dress form",
    objectPosition: "50% 40%",
  },
  coatFormWide: {
    src: "/images/catalog/slow-fashion-dress-from.jpg",
    alt: "A half-finished garment on a dress form in a workroom",
  },
  winterCoat: {
    src: "/images/catalog/woman-portrait-snowy-winter-day.jpg",
    alt: "Woman in a heavy wool coat on a winter street",
    objectPosition: "50% 25%",
  },
  leatherJacket: {
    src: "/images/catalog/leather-jacket-and-tea.jpg",
    alt: "Leather jacket over a cream knit, holding a cup",
    objectPosition: "50% 35%",
  },
  blackJacket: {
    src: "/images/catalog/urban-mens-fashion.jpg",
    alt: "Man in a black zip jacket",
    objectPosition: "50% 25%",
  },
  blazerWoman: {
    src: "/images/catalog/modern-business-woman-portrait.jpg",
    alt: "Woman in a softly tailored blazer",
    objectPosition: "50% 22%",
  },
  knitPortrait: {
    src: "/images/catalog/fashion-model-looks-at-camera.jpg",
    alt: "Studio portrait, knitwear study",
    objectPosition: "50% 20%",
  },
  knitWoman: {
    src: "/images/catalog/young-model-smiles-and-looks-down.jpg",
    alt: "Woman in a fine-gauge knit top",
    objectPosition: "50% 25%",
  },
  hatWoman: {
    src: "/images/catalog/young-woman-in-hat.jpg",
    alt: "Woman wearing a wide-brim felt hat",
    objectPosition: "50% 30%",
  },
  summerWoman: {
    src: "/images/catalog/woman-in-summer-fashion.jpg",
    alt: "Woman in a straw hat and denim top",
    objectPosition: "50% 25%",
  },
  dressSky: {
    src: "/images/catalog/woman-models-against-blue-sky.jpg",
    alt: "Woman in a printed dress against an open sky",
    objectPosition: "50% 20%",
  },
} satisfies Record<string, ProductImage>;

type PhotoKey = keyof typeof PHOTO;

interface ColorSpec {
  name: string;
  slug: string;
  hex: string;
  photos: [PhotoKey, ...PhotoKey[]];
}

interface ProductSpec {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: CategoryHandle;
  extraCollections?: CategoryHandle[];
  tags: string[];
  /** Minor units. Every variant of a product shares this price. */
  price: number;
  compareAtPrice?: number;
  colors: ColorSpec[];
  sizes?: SizeCode[];
  material: string;
  care: string[];
  fit: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  releasedAt: string;
  /** Sizes deliberately out of stock in every colour, to exercise stock states. */
  soldOutSizes?: SizeCode[];
}

const CATEGORY_PREFIX: Record<CategoryHandle, string> = {
  women: "WMN",
  men: "MEN",
  knitwear: "KNT",
  shirts: "SHT",
  trousers: "TRS",
  outerwear: "OUT",
  accessories: "ACC",
};

export const CATEGORY_LABELS: Record<CategoryHandle, string> = {
  women: "Women's Clothing",
  men: "Men's Clothing",
  knitwear: "Knitwear",
  shirts: "Shirts",
  trousers: "Trousers",
  outerwear: "Outerwear",
  accessories: "Accessories",
};

/** FNV-1a. Deterministic stock so a rebuild never reshuffles the UI. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function inventoryFor(sku: string, soldOut: boolean): number {
  if (soldOut) return 0;
  const h = hash(sku);
  // A few scattered single-size sellouts make the PDP stock UI real rather than
  // decorative; everything else stays in stock.
  if (h % 11 === 0) return 0;
  if (h % 7 === 0) return 2;
  return 3 + (h % 12);
}

function buildProduct(spec: ProductSpec, index: number): Product {
  const sizes = spec.sizes ?? [...SIZE_CODES];
  const prefix = CATEGORY_PREFIX[spec.category];

  const colors: ProductColor[] = spec.colors.map((color) => ({
    name: color.name,
    slug: color.slug,
    hex: color.hex,
    images: color.photos.map((key) => PHOTO[key]) as [ProductImage, ...ProductImage[]],
  }));

  const variants: ProductVariant[] = [];
  for (const color of spec.colors) {
    for (const size of sizes) {
      const sku = `AUR-${prefix}${String(index + 1).padStart(2, "0")}-${color.slug}-${size}`;
      const soldOut = spec.soldOutSizes?.includes(size) ?? false;
      variants.push({
        id: sku,
        sku,
        colorSlug: color.slug,
        size,
        price: { amount: spec.price, currency: "USD" },
        compareAtPrice: spec.compareAtPrice
          ? { amount: spec.compareAtPrice, currency: "USD" }
          : undefined,
        inventory: inventoryFor(sku, soldOut),
      });
    }
  }

  const collections = new Set<CategoryHandle>([spec.category, ...(spec.extraCollections ?? [])]);

  return {
    id: `aur-${String(index + 1).padStart(3, "0")}`,
    slug: spec.slug,
    title: spec.title,
    subtitle: spec.subtitle,
    description: spec.description,
    category: spec.category,
    collections: [...collections],
    tags: spec.tags,
    price: { amount: spec.price, currency: "USD" },
    compareAtPrice: spec.compareAtPrice
      ? { amount: spec.compareAtPrice, currency: "USD" }
      : undefined,
    colors,
    sizes,
    variants,
    material: spec.material,
    careInstructions: spec.care,
    fit: spec.fit,
    isNew: spec.isNew ?? false,
    isBestSeller: spec.isBestSeller ?? false,
    releasedAt: spec.releasedAt,
  };
}

const SPECS: ProductSpec[] = [
  // ---------------------------------------------------------------- women
  {
    slug: "fluid-cotton-tee",
    title: "Fluid Cotton Tee",
    subtitle: "Women · Essentials",
    description:
      "Cut from a fluid, garment-washed cotton that drapes rather than clings. A wide neckline and dropped shoulder keep it easy over tailoring or denim.",
    category: "women",
    extraCollections: ["knitwear"],
    tags: ["essentials", "cotton", "everyday"],
    price: 7200,
    colors: [
      { name: "Bone", slug: "bone", hex: "#EDE8DE", photos: ["whiteTeeWoman", "teeRailWhite"] },
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["teeRailGrey", "teeRailWhite"] },
    ],
    material: "100% organic cotton, 190 gsm",
    care: ["Machine wash cold with like colours", "Do not bleach", "Line dry", "Warm iron on reverse"],
    fit: "Relaxed. Model is 178 cm and wears a size S.",
    isNew: true,
    isBestSeller: true,
    releasedAt: "2026-09-18",
    soldOutSizes: ["XS"],
  },
  {
    slug: "compact-jersey-tee",
    title: "Compact Jersey Tee",
    subtitle: "Women · Essentials",
    description:
      "A denser jersey that holds its shape through a full day. Slightly cropped, with a clean bound neckline that will not stretch out.",
    category: "women",
    tags: ["essentials", "jersey", "everyday"],
    price: 5800,
    compareAtPrice: 6800,
    colors: [
      { name: "Chalk", slug: "chalk", hex: "#F2EFE8", photos: ["teeRailWhite", "teeRailGrey"] },
      { name: "Stone", slug: "stone", hex: "#B9B2A2", photos: ["teeRailGrey", "teeRailWhite"] },
    ],
    material: "100% compact cotton jersey, 220 gsm",
    care: ["Machine wash cold", "Do not tumble dry", "Iron on reverse"],
    fit: "Slightly cropped, true to size.",
    releasedAt: "2026-08-22",
  },
  {
    slug: "heavyweight-cotton-tee",
    title: "Heavyweight Cotton Tee",
    subtitle: "Men · Essentials",
    description:
      "A sturdy 240 gsm cotton with a squared shoulder. Built to be worn on its own and to soften with every wash.",
    category: "men",
    tags: ["essentials", "cotton", "heavyweight"],
    price: 6800,
    colors: [
      { name: "Bone", slug: "bone", hex: "#EDE8DE", photos: ["teeBack", "teeRailWhite"] },
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["teeRailWhite", "teeBack"] },
    ],
    material: "100% long-staple cotton, 240 gsm",
    care: ["Machine wash cold", "Line dry", "Do not bleach"],
    fit: "Regular. Model is 186 cm and wears a size M.",
    isNew: true,
    isBestSeller: true,
    releasedAt: "2026-09-20",
  },
  {
    slug: "relaxed-poplin-shirt",
    title: "Relaxed Poplin Shirt",
    subtitle: "Women · Shirts",
    description:
      "Crisp cotton poplin cut with a generous body and a softly rolled collar. Tuck it, knot it, or leave it open over a tee.",
    category: "shirts",
    extraCollections: ["women"],
    tags: ["poplin", "shirting", "tailoring"],
    price: 12800,
    colors: [
      { name: "Chalk", slug: "chalk", hex: "#F2EFE8", photos: ["poplinWoman", "greyShirt"] },
      { name: "Blue Stripe", slug: "blue-stripe", hex: "#9CA9B8", photos: ["greyShirt", "poplinWoman"] },
    ],
    material: "100% cotton poplin",
    care: ["Machine wash cold", "Iron while slightly damp", "Do not tumble dry"],
    fit: "Oversized. Size down for a closer fit.",
    isNew: true,
    releasedAt: "2026-09-12",
  },
  {
    slug: "silk-blend-slip-dress",
    title: "Silk-Blend Slip Dress",
    subtitle: "Women · Dresses",
    description:
      "Bias-cut from a silk and viscose blend so it moves with you. Finished with adjustable straps and a bare, clean neckline.",
    category: "women",
    tags: ["dresses", "silk", "evening"],
    price: 24500,
    colors: [
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["dressSky", "knitWoman"] },
      { name: "Oyster", slug: "oyster", hex: "#DCD5C6", photos: ["knitWoman", "dressSky"] },
    ],
    material: "62% silk, 38% LENZING™ ECOVERO™ viscose",
    care: ["Dry clean only", "Steam to release creases", "Store on a padded hanger"],
    fit: "Bias cut, skims the body. Model wears a size S.",
    releasedAt: "2026-07-30",
  },
  {
    slug: "wool-cashmere-cardigan",
    title: "Wool-Cashmere Cardigan",
    subtitle: "Women · Knitwear",
    description:
      "A fine-gauge cardigan in a wool and cashmere blend, knitted in a small mill in northern Italy. Horn buttons, ribbed cuffs, no logo.",
    category: "knitwear",
    extraCollections: ["women"],
    tags: ["knitwear", "wool", "cashmere"],
    price: 18500,
    colors: [
      { name: "Oat", slug: "oat", hex: "#CFC4AE", photos: ["knitPortrait", "knitWoman"] },
      { name: "Charcoal", slug: "charcoal", hex: "#3A3833", photos: ["knitWoman", "knitPortrait"] },
    ],
    material: "70% extra-fine merino wool, 30% cashmere",
    care: ["Hand wash cold", "Dry flat", "Do not wring", "De-pill with a comb"],
    fit: "Regular, slightly cropped. Model wears a size S.",
    isBestSeller: true,
    releasedAt: "2026-08-05",
  },
  {
    slug: "linen-wide-leg-trouser",
    title: "Linen Wide-Leg Trouser",
    subtitle: "Women · Trousers",
    description:
      "Heavyweight linen with a high, clean waistband and a leg that falls straight to the floor. Deep pockets, no pleats.",
    category: "trousers",
    extraCollections: ["women"],
    tags: ["linen", "trousers", "summer"],
    price: 13500,
    colors: [
      { name: "Sand", slug: "sand", hex: "#D8CDB8", photos: ["bootsCurb", "denimWoman"] },
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["denimWoman", "bootsCurb"] },
    ],
    material: "100% washed linen, 260 gsm",
    care: ["Machine wash cold", "Line dry", "Iron on reverse while damp"],
    fit: "High rise, wide leg. Inseam 78 cm in size S.",
    releasedAt: "2026-06-14",
  },
  {
    slug: "tailored-wool-blazer",
    title: "Tailored Wool Blazer",
    subtitle: "Women · Outerwear",
    description:
      "A single-breasted blazer with a soft shoulder and no lining in the body, so it stays light. Cut long enough to wear as a light coat.",
    category: "outerwear",
    extraCollections: ["women"],
    tags: ["tailoring", "wool", "blazer"],
    price: 29500,
    colors: [
      { name: "Graphite", slug: "graphite", hex: "#4A4741", photos: ["blazerWoman", "coatForm"] },
      { name: "Bone", slug: "bone", hex: "#EDE8DE", photos: ["coatForm", "blazerWoman"] },
    ],
    material: "98% virgin wool, 2% elastane",
    care: ["Dry clean only", "Steam to refresh", "Hang on a broad hanger"],
    fit: "Relaxed shoulder, longline. Model wears a size S.",
    isBestSeller: true,
    releasedAt: "2026-08-28",
  },
  {
    slug: "denim-chore-jacket",
    title: "Denim Chore Jacket",
    subtitle: "Women · Outerwear",
    description:
      "Rigid selvedge denim with three patch pockets and a boxy body. It will fade into your own shape over the first year.",
    category: "outerwear",
    extraCollections: ["women"],
    tags: ["denim", "jacket", "workwear"],
    price: 16500,
    colors: [
      { name: "Indigo", slug: "indigo", hex: "#3F5875", photos: ["denimWoman", "denimRailing"] },
      { name: "Ecru", slug: "ecru", hex: "#E4DCCB", photos: ["denimRailing", "denimWoman"] },
    ],
    material: "100% cotton selvedge denim, 12 oz",
    care: ["Wash sparingly, cold", "Hang dry", "Expect indigo transfer at first"],
    fit: "Boxy. Size down for a closer fit.",
    releasedAt: "2026-05-19",
  },
  {
    slug: "belted-trench-coat",
    title: "Belted Trench Coat",
    subtitle: "Women · Outerwear",
    description:
      "A cotton gabardine trench with a storm flap and a self belt. Unlined through the body so it layers over knitwear without bulk.",
    category: "outerwear",
    extraCollections: ["women"],
    tags: ["cotton", "coat", "trench"],
    price: 34000,
    colors: [
      { name: "Stone", slug: "stone", hex: "#B9B2A2", photos: ["winterCoat", "coatForm"] },
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["coatForm", "winterCoat"] },
    ],
    material: "100% cotton gabardine, water-repellent finish",
    care: ["Dry clean only", "Do not tumble dry", "Hang to air after wear"],
    fit: "Relaxed, belted at the waist.",
    isNew: true,
    releasedAt: "2026-10-02",
  },
  {
    slug: "straw-bucket-hat",
    title: "Straw Bucket Hat",
    subtitle: "Accessories",
    description:
      "Woven from a stiff paper straw with a soft cotton band inside. Packs flat without losing its crown.",
    category: "accessories",
    tags: ["hat", "straw", "summer"],
    price: 4500,
    colors: [
      { name: "Natural", slug: "natural", hex: "#D5C6A5", photos: ["hatWoman", "summerWoman"] },
    ],
    sizes: ["S", "M", "L"],
    material: "100% paper straw, cotton band",
    care: ["Spot clean only", "Do not soak", "Store flat"],
    fit: "S/M/L head circumference 56–60 cm.",
    releasedAt: "2026-06-01",
  },
  {
    slug: "merino-crew-knit",
    title: "Merino Crew Knit",
    subtitle: "Men · Knitwear",
    description:
      "A plain crew neck in extra-fine merino, knitted at a gauge fine enough to wear under a jacket. Ribbed hem and cuffs.",
    category: "knitwear",
    extraCollections: ["men"],
    tags: ["knitwear", "merino", "everyday"],
    price: 14500,
    colors: [
      { name: "Charcoal", slug: "charcoal", hex: "#3A3833", photos: ["knitWoman", "knitPortrait"] },
      { name: "Oat", slug: "oat", hex: "#CFC4AE", photos: ["knitPortrait", "knitWoman"] },
    ],
    material: "100% extra-fine merino wool",
    care: ["Hand wash cold", "Dry flat", "De-pill with a comb"],
    fit: "Regular. Model is 186 cm and wears a size M.",
    isBestSeller: true,
    releasedAt: "2026-08-11",
  },
  {
    slug: "cotton-cashmere-sweater",
    title: "Cotton-Cashmere Sweater",
    subtitle: "Men · Knitwear",
    description:
      "A mid-weight blend that works from September through April. Slightly longer body, ribbed at the neck and hem.",
    category: "knitwear",
    extraCollections: ["men"],
    tags: ["knitwear", "cashmere", "cotton"],
    price: 16500,
    compareAtPrice: 19500,
    colors: [
      { name: "Stone", slug: "stone", hex: "#B9B2A2", photos: ["knitWoman", "knitPortrait"] },
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["knitPortrait", "knitWoman"] },
    ],
    material: "85% cotton, 15% cashmere",
    care: ["Hand wash cold", "Dry flat", "Cool iron if needed"],
    fit: "Regular, slightly long in the body.",
    releasedAt: "2026-07-08",
  },
  {
    slug: "oxford-shirt",
    title: "Oxford Shirt",
    subtitle: "Men · Shirts",
    description:
      "A proper oxford in a heavier cotton yarn, with a button-down collar that holds its roll. Cut with room through the chest.",
    category: "shirts",
    extraCollections: ["men"],
    tags: ["shirting", "oxford", "cotton"],
    price: 11800,
    colors: [
      { name: "Blue Stripe", slug: "blue-stripe", hex: "#9CA9B8", photos: ["poplinMan", "greyShirt"] },
      { name: "Chalk", slug: "chalk", hex: "#F2EFE8", photos: ["greyShirt", "poplinMan"] },
    ],
    material: "100% cotton oxford",
    care: ["Machine wash cold", "Iron while damp", "Do not bleach"],
    fit: "Regular. Model is 186 cm and wears a size M.",
    isBestSeller: true,
    releasedAt: "2026-04-16",
  },
  {
    slug: "washed-poplin-shirt",
    title: "Washed Poplin Shirt",
    subtitle: "Men · Shirts",
    description:
      "Poplin that has already been washed twice, so it arrives soft and will not shrink in yours. Curved hem, single patch pocket.",
    category: "shirts",
    extraCollections: ["men"],
    tags: ["shirting", "poplin", "relaxed"],
    price: 11000,
    colors: [
      { name: "Sage", slug: "sage", hex: "#7C8268", photos: ["greenShirt", "poplinMan"] },
      { name: "Chalk", slug: "chalk", hex: "#F2EFE8", photos: ["poplinMan", "greenShirt"] },
    ],
    material: "100% washed cotton poplin",
    care: ["Machine wash cold", "Line dry", "Iron on reverse"],
    fit: "Relaxed. Size down for a closer fit.",
    isNew: true,
    releasedAt: "2026-09-30",
  },
  {
    slug: "pleated-wool-trouser",
    title: "Pleated Wool Trouser",
    subtitle: "Men · Trousers",
    description:
      "A single forward pleat, a high waist and a taper that stops just above the shoe. Cut from a dry, matte wool.",
    category: "trousers",
    extraCollections: ["men"],
    tags: ["trousers", "wool", "tailoring"],
    price: 15500,
    colors: [
      { name: "Charcoal", slug: "charcoal", hex: "#3A3833", photos: ["derbyShoes", "bootsCurb"] },
      { name: "Stone", slug: "stone", hex: "#B9B2A2", photos: ["bootsCurb", "derbyShoes"] },
    ],
    material: "100% tropical wool",
    care: ["Dry clean only", "Press with a damp cloth", "Hang from the cuffs"],
    fit: "High rise, tapered. Inseam 76 cm in size M.",
    releasedAt: "2026-05-02",
  },
  {
    slug: "straight-leg-denim",
    title: "Straight-Leg Denim",
    subtitle: "Men · Trousers",
    description:
      "Rigid 13 oz denim, straight from hip to hem, with a button fly and a clean, unwashed finish.",
    category: "trousers",
    extraCollections: ["men"],
    tags: ["denim", "trousers", "workwear"],
    price: 12500,
    colors: [
      { name: "Indigo", slug: "indigo", hex: "#3F5875", photos: ["denimRailing", "bootsCurb"] },
      { name: "Washed Black", slug: "washed-black", hex: "#3A3733", photos: ["bootsCurb", "denimRailing"] },
    ],
    material: "100% cotton denim, 13 oz",
    care: ["Wash cold, inside out", "Hang dry", "Wash sparingly"],
    fit: "Straight. Model wears a 32 waist.",
    isBestSeller: true,
    releasedAt: "2026-03-21",
  },
  {
    slug: "leather-moto-jacket",
    title: "Leather Moto Jacket",
    subtitle: "Men · Outerwear",
    description:
      "Vegetable-tanned lambskin with an asymmetric zip and a collar that stands when it is open. Lined in cotton sateen.",
    category: "outerwear",
    extraCollections: ["men"],
    tags: ["leather", "jacket", "outerwear"],
    price: 42000,
    colors: [
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["leatherJacket", "blackJacket"] },
      { name: "Espresso", slug: "espresso", hex: "#4A3A2E", photos: ["blackJacket", "leatherJacket"] },
    ],
    material: "100% lambskin leather, cotton sateen lining",
    care: ["Leather specialist clean only", "Condition once a year", "Store on a broad hanger"],
    fit: "Close fitting. Model is 186 cm and wears a size M.",
    releasedAt: "2026-08-19",
  },
  {
    slug: "wool-overcoat",
    title: "Wool Overcoat",
    subtitle: "Men · Outerwear",
    description:
      "A double-faced wool coat with no lining and hand-finished edges. Long enough to cover a jacket, light enough to drive in.",
    category: "outerwear",
    extraCollections: ["men"],
    tags: ["wool", "coat", "tailoring"],
    price: 48500,
    colors: [
      { name: "Heather Moss", slug: "heather-moss", hex: "#6E5B4A", photos: ["coatForm", "winterCoat"] },
      { name: "Graphite", slug: "graphite", hex: "#4A4741", photos: ["winterCoat", "coatForm"] },
    ],
    material: "90% virgin wool, 10% cashmere, double-faced",
    care: ["Dry clean only", "Brush after wear", "Air rather than wash"],
    fit: "Relaxed, longline. Model wears a size M.",
    isNew: true,
    isBestSeller: true,
    releasedAt: "2026-10-05",
    soldOutSizes: ["L"],
  },
  {
    slug: "quilted-liner-jacket",
    title: "Quilted Liner Jacket",
    subtitle: "Men · Outerwear",
    description:
      "A thin quilted layer designed to sit under a coat, or on its own when the weather turns in October. Snaps, not zips.",
    category: "outerwear",
    extraCollections: ["men"],
    tags: ["quilted", "jacket", "layer"],
    price: 24500,
    colors: [
      { name: "Graphite", slug: "graphite", hex: "#4A4741", photos: ["blackJacket", "leatherJacket"] },
      { name: "Stone", slug: "stone", hex: "#B9B2A2", photos: ["leatherJacket", "blackJacket"] },
    ],
    material: "Recycled polyamide shell, recycled polyester fill",
    care: ["Machine wash cold, gentle", "Tumble dry low to loft", "Do not iron"],
    fit: "Slim enough to layer. Model wears a size M.",
    releasedAt: "2026-09-06",
  },
  {
    slug: "leather-derby",
    title: "Leather Derby",
    subtitle: "Accessories",
    description:
      "A plain-toe derby on a leather sole, made in a family workshop in Portugal. Stitched, not glued, so it can be resoled.",
    category: "accessories",
    tags: ["shoes", "leather", "formal"],
    price: 26000,
    colors: [
      { name: "Black", slug: "black", hex: "#141311", photos: ["derbyShoes"] },
      { name: "Espresso", slug: "espresso", hex: "#4A3A2E", photos: ["derbyShoes"] },
    ],
    sizes: ["S", "M", "L", "XL"],
    material: "Full-grain calf leather, leather sole",
    care: ["Polish every few wears", "Use shoe trees", "Rest 24 hours between wears"],
    fit: "True to size. Sizes run 40–45 EU; choose your usual.",
    releasedAt: "2026-02-11",
    soldOutSizes: ["S"],
  },
  {
    slug: "suede-chelsea-boot",
    title: "Suede Chelsea Boot",
    subtitle: "Accessories",
    description:
      "A clean Chelsea in a water-resistant suede, with elastic gussets and a stacked leather heel.",
    category: "accessories",
    tags: ["shoes", "suede", "boots"],
    price: 29000,
    colors: [
      { name: "Tobacco", slug: "tobacco", hex: "#7A5B3E", photos: ["bootsCurb", "derbyShoes"] },
      { name: "Ink", slug: "ink", hex: "#1B1A15", photos: ["derbyShoes", "bootsCurb"] },
    ],
    sizes: ["S", "M", "L", "XL"],
    material: "Water-resistant suede, stacked leather heel",
    care: ["Brush with a suede brush", "Reproof each season", "Never soak"],
    fit: "Runs narrow. Size up if between sizes.",
    isNew: true,
    releasedAt: "2026-09-24",
  },
  {
    slug: "ribbed-wool-beanie",
    title: "Ribbed Wool Beanie",
    subtitle: "Accessories",
    description:
      "A close rib in a soft lambswool, knitted with a deep turn-up. No logo, no pom.",
    category: "accessories",
    tags: ["hat", "wool", "winter"],
    price: 4800,
    colors: [
      { name: "Charcoal", slug: "charcoal", hex: "#3A3833", photos: ["hatWoman", "knitWoman"] },
      { name: "Oat", slug: "oat", hex: "#CFC4AE", photos: ["knitWoman", "hatWoman"] },
    ],
    sizes: ["S", "M"],
    material: "100% lambswool",
    care: ["Hand wash cold", "Dry flat", "Do not wring"],
    fit: "One size fits most; S/M.",
    releasedAt: "2026-08-02",
  },
  {
    slug: "canvas-weekender-bag",
    title: "Canvas Weekender Bag",
    subtitle: "Accessories",
    description:
      "Heavy cotton canvas with leather handles and a solid brass zip. Sized for two nights, not two weeks.",
    category: "accessories",
    tags: ["bag", "canvas", "travel"],
    price: 21000,
    compareAtPrice: 24000,
    colors: [
      { name: "Sand", slug: "sand", hex: "#D8CDB8", photos: ["summerWoman", "hatWoman"] },
    ],
    sizes: ["M", "L"],
    material: "18 oz cotton canvas, vegetable-tanned leather trim",
    care: ["Spot clean with a damp cloth", "Do not machine wash", "Leather will patina"],
    fit: "48 × 28 × 24 cm.",
    releasedAt: "2026-04-04",
  },
  {
    slug: "merino-scarf",
    title: "Merino Scarf",
    subtitle: "Accessories",
    description:
      "A generous merino scarf, brushed on both sides for softness. Long enough to loop twice.",
    category: "accessories",
    tags: ["scarf", "merino", "winter"],
    price: 8500,
    colors: [
      { name: "Bone", slug: "bone", hex: "#EDE8DE", photos: ["knitPortrait", "winterCoat"] },
      { name: "Graphite", slug: "graphite", hex: "#4A4741", photos: ["winterCoat", "knitPortrait"] },
    ],
    sizes: ["M"],
    material: "100% brushed merino wool",
    care: ["Hand wash cold", "Dry flat", "De-pill with a comb"],
    fit: "200 × 35 cm.",
    isNew: true,
    releasedAt: "2026-09-15",
  },
];

export const catalog: Product[] = SPECS.map(buildProduct);

/** Referenced by tests to prove the dataset stays in shape. */
export const catalogSpecCount = SPECS.length;
