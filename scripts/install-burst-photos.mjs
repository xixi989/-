import fs from "node:fs";
import path from "node:path";

const SRC = "C:/Users/35251/AppData/Local/Temp/burst";
const DEST = "E:/电商网站/public/images/catalog";
const CATALOG = "E:/电商网站/src/data/catalog.ts";

// one extra fetch: neutral grey studio backdrop for the pleated wool trouser
const extra = {
  slug: "a-model-in-summer-fashion-with-grey-backdrop",
  name: "wool-trouser-grey.jpg",
};
const res = await fetch(
  `https://burst.shopifycdn.com/photos/${extra.slug}.jpg?width=1200&format=pjpg&exif=0&iptc=0`,
);
if (res.ok) {
  fs.writeFileSync(path.join(SRC, extra.name), Buffer.from(await res.arrayBuffer()));
  console.log("ok", extra.name);
} else {
  console.log("FAIL extra", res.status);
}

/** candidate file → production file name */
const INSTALL = [
  ["weekender-clutch.jpg", "weekender-bag-leather.jpg"],
  ["weekender-travel.jpg", "weekender-bag-held.jpg"],
  ["linen-khaki-trousers.jpg", "linen-trouser-khaki.jpg"],
  ["knit-cardigan-cream.jpg", "knit-cream-worn.jpg"],
  ["knit-cream-detail.jpg", "knit-cream-detail.jpg"],
  ["knit-crew-grey.jpg", "knit-grey-crew.jpg"],
  ["knit-wool-railing.jpg", "knit-wool-outdoor.jpg"],
  ["denim-jeans-pockets.jpg", "denim-jeans-detail.jpg"],
  ["wool-trouser-grey.jpg", "wool-trouser-grey.jpg"],
];

for (const [from, to] of INSTALL) {
  const src = path.join(SRC, from);
  if (!fs.existsSync(src)) {
    console.log("MISSING", from);
    continue;
  }
  fs.copyFileSync(src, path.join(DEST, to));
  console.log("installed", to, Math.round(fs.statSync(src).size / 1024) + "KB");
}

let s = fs.readFileSync(CATALOG, "utf8").replace(/\r\n/g, "\n");

const NEW_KEYS = `  // Burst by Shopify frames added in the asset pass — same library as the rest of
  // the catalogue, so light and palette stay consistent.
  weekenderBag: {
    src: "/images/catalog/weekender-bag-leather.jpg",
    alt: "Canvas weekender bag held by the handles, studio photograph",
    objectPosition: "50% 45%",
  },
  weekenderBagHeld: {
    src: "/images/catalog/weekender-bag-held.jpg",
    alt: "Weekender bag carried by hand, second angle",
    objectPosition: "50% 45%",
  },
  linenTrouserKhaki: {
    src: "/images/catalog/linen-trouser-khaki.jpg",
    alt: "Wide-leg linen trousers in khaki, full length",
    objectPosition: "50% 55%",
  },
  woolTrouserGrey: {
    src: "/images/catalog/wool-trouser-grey.jpg",
    alt: "Pleated wool trousers, full length, grey studio backdrop",
    objectPosition: "50% 50%",
  },
  knitCreamWorn: {
    src: "/images/catalog/knit-cream-worn.jpg",
    alt: "Cotton-cashmere cardigan in cream, worn",
    objectPosition: "50% 30%",
  },
  knitCreamDetail: {
    src: "/images/catalog/knit-cream-detail.jpg",
    alt: "Ribbed knit collar detail of a cream cardigan",
    objectPosition: "50% 40%",
  },
  knitGreyCrew: {
    src: "/images/catalog/knit-grey-crew.jpg",
    alt: "Merino crew knit in grey, worn close to the neck",
    objectPosition: "50% 35%",
  },
  knitWoolOutdoor: {
    src: "/images/catalog/knit-wool-outdoor.jpg",
    alt: "Wool sweater in blue-grey, worn outdoors",
    objectPosition: "50% 30%",
  },
  denimJeansDetail: {
    src: "/images/catalog/denim-jeans-detail.jpg",
    alt: "Straight-leg denim jeans, waist and pocket detail",
    objectPosition: "50% 35%",
  },
`;
if (!s.includes("weekenderBag: {")) {
  s = s.replace("  dressSky: {", NEW_KEYS + "  dressSky: {");
  console.log("photo keys added");
}

const REWIRE = {
  "canvas-weekender-bag": '["weekenderBag", "weekenderBagHeld"]',
  "linen-wide-leg-trouser": '["linenTrouserKhaki"]',
  "pleated-wool-trouser": '["woolTrouserGrey"]',
  "wool-cashmere-cardigan": '["knitCreamWorn", "knitCreamDetail"]',
  "merino-crew-knit": '["knitGreyCrew"]',
  "cotton-cashmere-sweater": '["knitWoolOutdoor"]',
  "straight-leg-denim": '["denimJeansDetail"]',
};

const parts = s.split('\n  {\n    slug: "');
for (let i = 1; i < parts.length; i += 1) {
  const slug = parts[i].slice(0, parts[i].indexOf('"'));
  if (REWIRE[slug]) {
    parts[i] = parts[i].replace(/photos: \[[^\]]*\]/g, `photos: ${REWIRE[slug]}`);
    console.log("rewired", slug);
  }
}
s = parts.join('\n  {\n    slug: "');

// Pending list is now only about colourway coverage, not category.
s = s.replace(
  /export const PHOTO_PENDING: Record<string, string> = \{[\s\S]*?\n\};/,
  `export const PHOTO_PENDING: Record<string, string> = {
  // Category is now correct for every product. What remains is per-colourway
  // photography: no free library has the same garment in two colours, so the
  // products below still show one frame for both swatches.
};`,
);

fs.writeFileSync(CATALOG, s);
console.log("done");
