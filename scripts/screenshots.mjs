import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:3414";
const OUT = "E:/电商网站/docs/portfolio/screenshots";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });

async function shot(name, width, height, prepare) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: "en-US" });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  if (prepare) await prepare(page);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log("wrote", name);
  await context.close();
}

const seedBag = async (page) => {
  await page.goto(BASE + "/products/wool-overcoat", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "M", exact: true }).first().click();
  await page.getByRole("button", { name: /add(ed)? to bag/i }).click();
  await page.keyboard.press("Escape");
};

const seedWishlist = async (page) => {
  await page.goto(BASE + "/collections/women", { waitUntil: "networkidle" });
  for (const i of [0, 2, 4]) {
    await page.locator("article").nth(i).getByRole("button", { name: /save .* to wishlist/i }).click();
  }
};

const setRegion = (country, language) => async (page) => {
  await page.locator("header").getByRole("button", { name: /change region and currency/i }).click();
  const dialog = page.locator('[role="dialog"]').filter({ hasText: /Region & currency/ }).first();
  await dialog.getByRole("button", { name: new RegExp(country, "i") }).click();
  if (language) await dialog.getByRole("button", { name: language, exact: true }).click();
  await page.keyboard.press("Escape");
};

// 1. home desktop
await shot("01-home-desktop", 1440, 900, async (p) => {
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
});

// 2. home mobile
await shot("02-home-mobile", 390, 844, async (p) => {
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
});

// 3. collection
await shot("03-collection-desktop", 1440, 900, async (p) => {
  await p.goto(BASE + "/collections/women", { waitUntil: "networkidle" });
});

// 4. product detail
await shot("04-product-desktop", 1440, 900, async (p) => {
  await p.goto(BASE + "/products/wool-overcoat", { waitUntil: "networkidle" });
});

// 5. cart with one line
await shot("05-cart-desktop", 1440, 900, async (p) => {
  await seedBag(p);
  await p.goto(BASE + "/cart", { waitUntil: "networkidle" });
});

// 6. wishlist
await shot("06-wishlist-desktop", 1440, 900, async (p) => {
  await seedWishlist(p);
  await p.goto(BASE + "/wishlist", { waitUntil: "networkidle" });
});

// 7. search results
await shot("07-search-results", 1440, 900, async (p) => {
  await p.goto(BASE + "/search?q=wool", { waitUntil: "networkidle" });
});

// 8. GBP display
await shot("08-currency-gbp", 1440, 900, async (p) => {
  await setRegion("United Kingdom")(p);
  await p.goto(BASE + "/collections/women", { waitUntil: "networkidle" });
});

// 9. German interface
await shot("09-language-de", 1440, 900, async (p) => {
  await seedBag(p);
  await setRegion("Germany", "Deutsch")(p);
  await p.goto(BASE + "/cart", { waitUntil: "networkidle" });
});

// 10. mobile product
await shot("10-product-mobile", 390, 844, async (p) => {
  await p.goto(BASE + "/products/wool-overcoat", { waitUntil: "networkidle" });
});

await browser.close();
console.log("done");
