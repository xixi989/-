import { expect, test } from "./fixtures";

test.describe("home", () => {
  test("renders the brand, navigation and product entries", async ({ freshPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /primary/i })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: /aurel studio/i })).toBeVisible();

    // Hero imagery is the LCP element — it must actually decode.
    const hero = page.locator("img").first();
    await expect(hero).toBeVisible();
    expect(await hero.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    // New Arrivals must link into real product pages.
    const productLinks = page.locator('a[href^="/products/"]');
    expect(await productLinks.count()).toBeGreaterThan(3);
  });

  test("every header and footer link resolves", async ({ freshPage: page, request }) => {
    await page.goto("/");

    const hrefs = await page
      .locator('header a[href^="/"], footer a[href^="/"]')
      .evaluateAll((nodes) => [...new Set(nodes.map((n) => n.getAttribute("href") ?? ""))].filter(Boolean));

    expect(hrefs.length).toBeGreaterThan(10);
    for (const href of hrefs) {
      const response = await request.get(href, { maxRedirects: 0 });
      expect(response.status(), `${href} should not 404`).toBeLessThan(400);
    }
  });
});

test.describe("collection", () => {
  test("lists products and opens a product page", async ({ freshPage: page }) => {
    await page.goto("/collections/women");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/women/i);
    const cards = page.locator("article");
    expect(await cards.count()).toBeGreaterThanOrEqual(6);

    await cards.first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/products\/[a-z0-9-]+$/);
    await expect(page.getByRole("button", { name: /size guide/i })).toBeVisible();
  });

  test("filters by colour, size and price and keeps it in the URL", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    const total = await page.locator("article").count();

    const rail = page.locator("aside").first();

    // The inputs are sr-only by design, so drive them the way a shopper does:
    // click the visible label text.
    await rail.getByText("Ink", { exact: true }).click();
    await expect(page).toHaveURL(/color=ink/);
    await expect(page.locator("article").first()).toBeVisible();
    expect(await page.locator("article").count()).toBeLessThanOrEqual(total);

    await rail.getByText("M", { exact: true }).click();
    await expect(page).toHaveURL(/size=M/);

    await rail.getByText(/^Under \$100/).click();
    await expect(page).toHaveURL(/price=under-100/);

    // The URL is the state: a reload must restore the same filtered view.
    await page.reload();
    await expect(page).toHaveURL(/price=under-100/);
    await expect(page).toHaveURL(/size=M/);
    await expect(page.locator("aside input[type=\"checkbox\"]:checked")).toHaveCount(3);
  });

  test("sorts by price and keeps the order in the URL", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    await page.getByLabel(/sort products/i).selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);

    const readPrices = async () => {
      // One price per card: a sale card also renders a struck-through compare-at
      // figure, which must not be read as its own product price.
      const values = await page.locator("article").evaluateAll((cards) =>
        cards
          .map((card) => card.querySelector(".tnum")?.textContent ?? "")
          // A sale card concatenates price and compare-at in one node, so take
          // the first amount only.
          .map((text) => text.match(/[0-9][0-9.,]*/)?.[0] ?? "")
          .map((text) => Number(text.replace(/,/g, "")))
          .filter((value) => Number.isFinite(value) && value > 0),
      );
      return values;
    };

    // The server re-renders on sort, so poll rather than assert once.
    await expect
      .poll(async () => {
        const values = (await readPrices()).slice(0, 4);
        return values.every((value, index, list) => index === 0 || list[index - 1] <= value);
      }, { timeout: 10_000 })
      .toBe(true);
  });

  test("shows an empty state for an impossible combination", async ({ freshPage: page }) => {
    await page.goto("/collections/women?color=oat&price=over-200");
    await expect(page.getByText(/nothing in this collection fits/i)).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
  });
});

test.describe("product detail", () => {
  test("switches gallery image with the colour and blocks sold-out sizes", async ({ freshPage: page }) => {
    await page.goto("/products/wool-overcoat");

    const mainImage = page.getByRole("button", { name: /enlarge image/i }).locator("img");
    const firstAlt = await mainImage.getAttribute("alt");

    await page.getByRole("button", { name: /^graphite/i }).click();
    await expect(mainImage).not.toHaveAttribute("alt", firstAlt ?? "");

    // Size L is deliberately sold out in this product.
    const sizeL = page.getByRole("button", { name: "L", exact: true }).first();
    await expect(sizeL).toBeDisabled();

    await page.getByRole("button", { name: "M", exact: true }).first().click();
    await expect(page.getByText(/in stock/i).first()).toBeVisible();
  });

  test("adds the exact variant that was chosen", async ({ freshPage: page }) => {
    await page.goto("/products/wool-overcoat");

    await page.getByRole("button", { name: /^heather moss/i }).click();
    await page.getByRole("button", { name: "M", exact: true }).first().click();
    await page.getByRole("button", { name: /^add to bag$/i }).click();

    const drawer = page.getByRole("dialog", { name: /shopping bag/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Heather Moss \/ M/)).toBeVisible();
  });
});
