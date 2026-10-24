import { chooseLanguage, chooseRegion, expect, test } from "./fixtures";

test.describe("multi-currency", () => {
  test("defaults to USD", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    await expect(page.locator("article .tnum").first()).toContainText("$");
    await expect(page.getByText(/shipping on orders over \$150/i)).toBeVisible();
  });

  test("applies GBP to copy, cards, PDP and cart", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    await chooseRegion(page, "United Kingdom");

    await expect(page.getByText(/shipping on orders over £/i)).toBeVisible();
    await expect(page.locator("article .tnum").first()).toContainText("£");

    // The nav price band is derived from the same currency, not hard-coded.
    const bandLabel = await page.locator("header a").filter({ hasText: /under|unter/i }).first().textContent();
    expect(bandLabel).toMatch(/£\s?\d|\d+\s?£/);

    await page.goto("/products/fluid-cotton-tee");
    await expect(page.getByText(/shipping on orders over £/i).first()).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\$\d/);

    await page.goto("/cart");
    await expect(page.locator("body")).toContainText("£") ;
  });

  test("applies EUR for Germany", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    await chooseRegion(page, "Germany");
    await expect(page.locator("article .tnum").first()).toContainText("€");
  });

  test("keeps the bag when the currency changes", async ({ freshPage: page }) => {
    await page.goto("/products/fluid-cotton-tee");
    await page.getByRole("button", { name: "S", exact: true }).first().click();
    await page.getByRole("button", { name: /add(ed)? to bag/i }).click();
    await expect(page.getByRole("dialog", { name: /shopping bag/i })).toBeVisible();
    await page.keyboard.press("Escape");

    await chooseRegion(page, "Germany");
    await expect(page.locator("header").getByRole("button", { name: /shopping bag, 1 item/i })).toBeVisible();
  });
});

test.describe("internationalisation", () => {
  test("switches the interface to German without losing the bag", async ({ freshPage: page }) => {
    await page.goto("/products/fluid-cotton-tee");
    await page.getByRole("button", { name: "S", exact: true }).first().click();
    await page.getByRole("button", { name: /add(ed)? to bag/i }).click();
    await page.keyboard.press("Escape");

    await chooseLanguage(page, "Deutsch");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.locator("header").getByRole("link", { name: "Damen" })).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/warenkorb/i);
    await expect(page.locator("header").getByRole("button", { name: /warenkorb, 1 artikel/i })).toBeVisible();
  });

  test("formats German amounts with a comma and a trailing symbol", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    await chooseRegion(page, "Germany");
    await chooseLanguage(page, "Deutsch");

    const price = await page.locator("article .tnum").first().textContent();
    expect(price?.trim()).toMatch(/^\d+([.,]\d{2})?\s?€$/);
  });
});

test.describe("technical SEO", () => {
  test("home carries title, description, canonical and Open Graph", async ({ freshPage: page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Aurel Studio — Contemporary Essentials/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{60,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\//);
  });

  test("product page ships matching JSON-LD priced in USD", async ({ freshPage: page }) => {
    await page.goto("/products/wool-overcoat");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/products\/wool-overcoat$/);

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? "{}");

    expect(data["@type"]).toBe("Product");
    expect(data.name).toBe("Wool Overcoat");
    expect(data.brand.name).toBe("AUREL STUDIO");
    expect(data.offers.length).toBe(10);
    expect(new Set(data.offers.map((o: { sku: string }) => o.sku)).size).toBe(10);
    for (const offer of data.offers) {
      expect(offer.priceCurrency).toBe("USD");
      expect(offer.price).toBe("485.00");
    }
    expect(raw).not.toMatch(/aggregateRating|reviewCount|gtin/);
  });

  test("sitemap lists canonical product and collection URLs only", async ({ freshPage: page, request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(urls.length).toBeGreaterThanOrEqual(33);
    expect(urls.some((u) => u.endsWith("/products/wool-overcoat"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/collections/women"))).toBe(true);
    expect(urls.every((u) => !u.includes("?"))).toBe(true);
    expect(urls.some((u) => /\/(cart|wishlist|search)$/.test(u))).toBe(false);
  });

  test("robots and noindex surfaces agree", async ({ freshPage: page, request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/(Allow|Disallow):/);

    for (const path of ["/cart", "/wishlist", "/search?q=wool"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), `${path} should be noindex`).toHaveAttribute(
        "content",
        /noindex/,
      );
    }
  });

  test("unknown routes render the branded 404 with a single robots tag", async ({ freshPage: page }) => {
    const response = await page.goto("/definitely-not-a-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/folded away/i)).toBeVisible();

    // A soft 404 on a dynamic segment still must not ship contradictory tags.
    const productResponse = await page.goto("/products/nope-12345");
    await expect(page.getByText(/folded away/i)).toBeVisible();
    expect([200, 404]).toContain(productResponse?.status());
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    await expect(page.locator('meta[name="robots"][content*="index, follow"]')).toHaveCount(0);
  });
});

test.describe("responsive", () => {
  test("no horizontal overflow at 375px across key pages", async ({ freshPage: page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    for (const path of ["/", "/collections/women", "/products/wool-overcoat", "/cart", "/wishlist", "/search?q=wool"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows at 375px`).toBeLessThanOrEqual(1);
    }
  });
});
