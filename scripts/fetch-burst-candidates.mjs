import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const OUT = "C:/Users/35251/AppData/Local/Temp/burst";
fs.mkdirSync(OUT, { recursive: true });

// Burst by Shopify — same library the project already uses, so palette and
// lighting match the existing catalogue frames.
const CANDIDATES = [
  ["a-model-in-khaki-trousers-and-a-striped-t-shirt", "linen-khaki-trousers"],
  ["close-up-of-model-wearing-cream-sweater", "knit-cardigan-cream"],
  ["close-up-showing-detail-of-cream-sweater", "knit-cream-detail"],
  ["persons-torso-and-neck-in-a-grey-sweater", "knit-crew-grey"],
  ["model-wearing-a-wooly-sweater-leans-against-a-railing", "knit-wool-railing"],
  ["woman-wearing-grey-and-green-sweater", "knit-grey-green"],
  ["person-holding-their-hands-in-jean-pockets", "denim-jeans-pockets"],
  ["man-holding-his-leather-travel-bag", "weekender-travel"],
  ["man-clutching-his-leather-duffle-bag", "weekender-clutch"],
  ["casual-urban-mens-fashion-jeans", "denim-urban"],
];

for (const [slug, name] of CANDIDATES) {
  const url = `https://burst.shopifycdn.com/photos/${slug}.jpg?width=1200&format=pjpg&exif=0&iptc=0`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log("FAIL", slug, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT, `${name}.jpg`), buf);
    console.log("ok", name, Math.round(buf.length / 1024) + "KB");
  } catch (error) {
    console.log("ERR", slug, String(error).slice(0, 60));
  }
}

const files = fs.readdirSync(OUT).filter((f) => f.endsWith(".jpg")).sort();
const cards = files
  .map((file, i) => {
    const b64 = fs.readFileSync(path.join(OUT, file)).toString("base64");
    return `<figure><img src="data:image/jpeg;base64,${b64}"/><figcaption>${i + 1}. ${file.replace(".jpg", "")}</figcaption></figure>`;
  })
  .join("");

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1240, height: 1100 } });
await page.setContent(
  `<body style="margin:0;background:#F6F3EC;font:11px/1.4 sans-serif;color:#1A1916">
     <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:8px">${cards}</div>
     <style>figure{margin:0}img{width:100%;height:300px;object-fit:cover;display:block}figcaption{padding:4px}</style>
   </body>`,
  { waitUntil: "load" },
);
await page.screenshot({ path: path.join(OUT, "_sheet.png"), fullPage: true });
await browser.close();
console.log("sheet:", files.length);
