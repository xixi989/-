import fs from "node:fs";
import path from "node:path";

const CAND = "C:/Users/35251/AppData/Local/Temp/candidates";
const DEST = "E:/电商网站/public/images/catalog";
const CATALOG = "E:/电商网站/src/data/catalog.ts";

/** file in candidates → stable production filename */
const INSTALL = [
  ["bag-hotel-room-5120082.jpg", "weekender-bag-studio.jpg"],
  ["knit-hats-flatlay-37484033.jpg", "knit-beanie-oat.jpg"],
  ["beanie-street-40340508.jpg", "knit-beanie-worn.jpg"],
  ["linen-outfit-6996128.jpg", "linen-trouser-wide-leg.jpg"],
  ["white-outfit-trousers-21768392.jpg", "wool-trouser-cream.jpg"],
  ["scarf-sweater-6630873.jpg", "merino-scarf-grey.jpg"],
];

for (const [from, to] of INSTALL) {
  const src = path.join(CAND, from);
  if (!fs.existsSync(src)) {
    console.log("MISSING", from);
    continue;
  }
  fs.copyFileSync(src, path.join(DEST, to));
  console.log("installed", to, Math.round(fs.statSync(src).size / 1024) + "KB");
}

let s = fs.readFileSync(CATALOG, "utf8");

// 1) new photo keys, inserted before the closing brace of the PHOTOS record
const ANCHOR = "  dressSky: {";
const NEW_KEYS = `  // Pexels photography added in the asset pass. Each alt names the category so the
  // catalogue test can hold the mapping to the same standard as the Burst frames.
  weekenderBag: {
    src: "/images/catalog/weekender-bag-studio.jpg",
    alt: "Canvas weekender bag with leather handles, studio photograph",
    objectPosition: "50% 45%",
  },
  knitBeanieOat: {
    src: "/images/catalog/knit-beanie-oat.jpg",
    alt: "Ribbed knit beanie in oat, close-up",
    objectPosition: "50% 40%",
  },
  knitBeanieWorn: {
    src: "/images/catalog/knit-beanie-worn.jpg",
    alt: "Knitted beanie worn on a city street",
    objectPosition: "50% 25%",
  },
  linenTrouser: {
    src: "/images/catalog/linen-trouser-wide-leg.jpg",
    alt: "Wide-leg linen trousers, full length",
    objectPosition: "50% 55%",
  },
  woolTrouserCream: {
    src: "/images/catalog/wool-trouser-cream.jpg",
    alt: "Tailored wide-leg trousers in cream, studio photograph",
    objectPosition: "50% 45%",
  },
  merinoScarf: {
    src: "/images/catalog/merino-scarf-grey.jpg",
    alt: "Merino scarf in grey, worn close to the neck",
    objectPosition: "50% 35%",
  },
`;
if (!s.includes("weekenderBag: {")) {
  s = s.replace(ANCHOR, NEW_KEYS + ANCHOR);
  console.log("photo keys added");
}

// 2) rewire the five products' colourway photography
const REWIRE = {
  "canvas-weekender-bag": '["weekenderBag"]',
  "ribbed-wool-beanie": '["knitBeanieOat", "knitBeanieWorn"]',
  "linen-wide-leg-trouser": '["linenTrouser"]',
  "pleated-wool-trouser": '["woolTrouserCream"]',
  "merino-scarf": '["merinoScarf"]',
};

const parts = s.split(/\n  \{\n    slug: /);
for (let i = 1; i < parts.length; i += 1) {
  const slug = parts[i].slice(0, parts[i].indexOf('"'));
  const replacement = REWIRE[slug];
  if (!replacement) continue;

  const before = parts[i];
  parts[i] = parts[i].replace(/photos: \[[^\]]*\]/g, `photos: ${replacement}`);
  if (before !== parts[i]) console.log("rewired", slug);
}
s = parts.join("\n  {\n    slug: ");

// 3) the pending list is now empty: every product shows its own category
s = s.replace(
  /export const PHOTO_PENDING: Record<string, string> = \{[\s\S]*?\n\};/,
  `export const PHOTO_PENDING: Record<string, string> = {
  // Every product now shows its own category. What remains unmatched is colour
  // fidelity: three of these frames are representative stock (a black bag for a
  // sand colourway, cream trousers for charcoal, an oat beanie for both). That is
  // recorded in IMAGE_AUDIT_REPORT.md rather than hidden behind a filter.
};`,
);
console.log("pending cleared:", /PHOTO_PENDING[\s\S]{0,80}\n\};/.test(s));

fs.writeFileSync(CATALOG, s);
