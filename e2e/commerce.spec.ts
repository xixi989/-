import { addFromProductPage, addToBagButton, expect, openSearch, test } from "./fixtures";

const drawerOf = (page: import("@playwright/test").Page) =>
  page.getByRole("dialog", { name: /shopping bag/i });

test.describe("cart", () => {
  test("adds a variant and reflects it in the header", async ({ freshPage: page }) => {
    await page.goto("/products/fluid-cotton-tee");
    await addFromProductPage(page, "S");

    const drawer = drawerOf(page);
    await expect(drawer.getByText(/Bone \/ S|Chalk \/ S/)).toBeVisible();
    await expect(page.locator("header").getByRole("button", { name: /shopping bag, 1 item/i })).toBeVisible();
  });

  test("merges the same SKU and separates a different size", async ({ freshPage: page }) => {
    await page.goto("/products/fluid-cotton-tee");
    await addFromProductPage(page, "S");
    await page.keyboard.press("Escape");

    // Same variant again → one line, quantity 2.
    await addToBagButton(page).click();
    const drawer = drawerOf(page);
    await expect(drawer.locator("li")).toHaveCount(1);
    await expect(drawer.locator("li span.tnum").first()).toHaveText("2");

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "M", exact: true }).first().click();
    await addToBagButton(page).click();
    await expect(drawer.locator("li")).toHaveCount(2);
  });

  test("updates quantity, subtotal and removal on the cart page", async ({ freshPage: page }) => {
    await page.goto("/products/wool-overcoat");
    await addFromProductPage(page, "M");
    await page.goto("/cart");

    const subtotal = page.locator("aside dd.tnum").first();
    const first = await subtotal.textContent();

    await page.getByRole("button", { name: /increase quantity/i }).first().click();
    await expect(subtotal).not.toHaveText(first ?? "");

    const doubled = await subtotal.textContent();
    await page.getByRole("button", { name: /decrease quantity/i }).first().click();
    await expect(subtotal).toHaveText(first ?? "");
    expect(doubled).not.toBe(first);

    await page.getByRole("button", { name: /^remove$/i }).first().click();
    await expect(page.getByText(/your bag is empty/i)).toBeVisible();
  });

  test("survives a reload and never drops below one unit", async ({ freshPage: page }) => {
    await page.goto("/products/merino-scarf");
    await addFromProductPage(page, "M");

    await page.goto("/cart");
    const decrease = page.getByRole("button", { name: /decrease quantity/i }).first();
    await expect(decrease).toBeDisabled();

    await page.reload();
    await expect(page.getByRole("button", { name: /shopping bag, 1 item/i })).toBeVisible();
    await expect(page.locator("li").filter({ hasText: /merino|scarf/i }).first()).toBeVisible();
  });

  test("keeps checkout visibly disabled with an explanation", async ({ freshPage: page }) => {
    await page.goto("/products/fluid-cotton-tee");
    await addFromProductPage(page, "S");
    await page.goto("/cart");

    const checkout = page.getByRole("button", { name: /checkout/i }).first();
    await expect(checkout).toBeDisabled();
    await expect(page.getByText(/no payment is taken/i).first()).toBeVisible();
  });
});

test.describe("wishlist", () => {
  test("saves, lists and removes a piece", async ({ freshPage: page }) => {
    await page.goto("/collections/women");

    const firstHeart = page.getByRole("button", { name: /^save .* to wishlist$/i }).first();
    await firstHeart.click();
    await expect(page.locator("header").getByRole("link", { name: /wishlist, 1 item/i })).toBeVisible();

    await page.goto("/wishlist");
    await expect(page.locator("article")).toHaveCount(1);

    // Unsave from the wishlist page itself.
    await page.getByRole("button", { name: /^remove .* from wishlist$/i }).first().click();
    await expect(page.getByText(/nothing saved yet/i)).toBeVisible();
  });

  test("restores saved pieces after a reload", async ({ freshPage: page }) => {
    await page.goto("/collections/women");
    await page.getByRole("button", { name: /^save .* to wishlist$/i }).first().click();
    await page.reload();
    await expect(page.locator("header").getByRole("link", { name: /wishlist, 1 item/i })).toBeVisible();
  });
});

test.describe("search", () => {
  test("suggests live results and opens the product", async ({ freshPage: page }) => {
    await page.goto("/");
    const input = await openSearch(page);
    await input.fill("overcoat");

    const firstResult = page.getByRole("dialog", { name: /^search$/i }).getByRole("link").first();
    await expect(firstResult).toContainText(/overcoat/i);
    await firstResult.click();
    await expect(page).toHaveURL(/\/products\/wool-overcoat$/);
  });

  test("shows a no-results message", async ({ freshPage: page }) => {
    await page.goto("/");
    const input = await openSearch(page);
    await input.fill("spacesuit");

    await expect(page.getByText(/no results for/i)).toBeVisible();
  });

  test("submits to the results page, which survives a reload", async ({ freshPage: page }) => {
    await page.goto("/search?q=knitwear");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/knitwear/i);
    const count = await page.locator("article").count();
    expect(count).toBeGreaterThan(0);

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/knitwear/i);
    expect(await page.locator("article").count()).toBe(count);
  });
});
