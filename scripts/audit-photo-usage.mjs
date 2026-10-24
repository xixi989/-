import fs from "node:fs";

const raw = fs.readFileSync("E:/电商网站/src/data/catalog.ts", "utf8");
const s = raw.replace(/\r\n/g, "\n");

const blocks = s.split('\n  {\n    slug: "').slice(1);
const products = blocks.map((block) => {
  const slug = block.slice(0, block.indexOf('"'));
  const title = (block.match(/title: "([^"]+)"/) ?? [])[1] ?? "";
  const colors = [...block.matchAll(/\{ name: "([^"]+)", slug: "([^"]+)", hex: "[^"]+", photos: \[([^\]]*)\] \}/g)].map(
    (m) => [m[1], m[3].replace(/"/g, "").split(",").map((x) => x.trim()).filter(Boolean)],
  );
  return { slug, title, colors };
});

const use = new Map();
for (const p of products) {
  for (const [name, photos] of p.colors) {
    for (const key of photos) {
      if (!use.has(key)) use.set(key, []);
      use.get(key).push(`${p.slug} [${name}]`);
    }
  }
}

console.log("products parsed:", products.length);
console.log("\n=== photo keys used by more than one product ===");
for (const [key, users] of [...use].sort()) {
  const slugs = [...new Set(users.map((u) => u.split(" ")[0]))];
  if (slugs.length > 1) console.log(key.padEnd(14), `x${slugs.length}:`, slugs.join(", "));
}

console.log("\n=== products with 2+ colourways but a single shared frame ===");
for (const p of products) {
  const all = new Set(p.colors.flatMap(([, photos]) => photos));
  if (p.colors.length > 1 && all.size < p.colors.length) {
    console.log(p.slug.padEnd(26), p.colors.map(([n]) => n).join(" / "), "→", [...all].join(", "));
  }
}

console.log("\n=== two colourways, identical photo list ===");
for (const p of products) {
  if (p.colors.length < 2) continue;
  const lists = p.colors.map(([, photos]) => photos.join("|"));
  if (new Set(lists).size === 1) console.log(p.slug.padEnd(26), lists[0]);
}
