import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const OUT = "C:/Users/35251/AppData/Local/Temp/candidates";
fs.mkdirSync(OUT, { recursive: true });

// Candidates gathered from Pexels search pages. Each entry is what the page claimed
// the subject is — the contact sheet is how we check that claim.
const CANDIDATES = [
  { id: "37484033", slug: "knit-hats-flatlay", note: "beanie / knit hats on wood" },
  { id: "15490507", slug: "knit-hat-portrait", note: "woman wearing knit hat" },
  { id: "40340508", slug: "beanie-street", note: "woman in knitted beanie" },
  { id: "11630887", slug: "knit-cap-object", note: "knitted cap on table" },
  { id: "13872590", slug: "duffel-on-ground", note: "duffel bag on ground" },
  { id: "5120082", slug: "bag-hotel-room", note: "sports bag on bed" },
  { id: "27793087", slug: "bag-on-shelf", note: "bag on shelf" },
  { id: "6996128", slug: "linen-outfit", note: "woman in linen outfit" },
  { id: "21768392", slug: "white-outfit-trousers", note: "woman in white outfit" },
  { id: "6630873", slug: "scarf-sweater", note: "sweater and scarf" },
  { id: "10947222", slug: "scarf-snow", note: "scarf in snow" },
  { id: "9563714", slug: "red-scarf-portrait", note: "woman wrapped in scarf" },
];

for (const c of CANDIDATES) {
  const url = `https://images.pexels.com/photos/${c.id}/pexels-photo-${c.id}.jpeg?auto=compress&cs=tinysrgb&w=900`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log("FAIL", c.id, res.status);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(OUT, `${c.slug}-${c.id}.jpg`), buf);
  console.log("ok", c.id, Math.round(buf.length / 1024) + "KB");
}

const files = fs.readdirSync(OUT).filter((f) => f.endsWith(".jpg")).sort();
const cards = files
  .map((file, index) => {
    const b64 = fs.readFileSync(path.join(OUT, file)).toString("base64");
    const [slug, id] = [file.replace(/-\d+\.jpg$/, ""), file.match(/-(\d+)\.jpg$/)?.[1]];
    const note = CANDIDATES.find((c) => c.id === id)?.note ?? "";
    return `<figure>
      <img src="data:image/jpeg;base64,${b64}" />
      <figcaption>${index + 1}. <b>${slug}</b> · ${id}<br/><span>${note}</span></figcaption>
    </figure>`;
  })
  .join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#F6F3EC;font:11px/1.4 -apple-system,Segoe UI,sans-serif;color:#1A1916}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px}
  figure{margin:0;background:#fff}
  img{width:100%;height:210px;object-fit:cover;display:block}
  figcaption{padding:5px 6px;border-top:1px solid #ddd}
  span{color:#777}
</style></head><body><div class="grid">${cards}</div></body></html>`;

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: path.join(OUT, "_sheet.png"), fullPage: true });
await browser.close();
console.log("sheet written", files.length, "images");
