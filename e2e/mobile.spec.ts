import { expect, test } from "./fixtures";

/**
 * Mobile gets its own smoke suite instead of the full cross-viewport matrix.
 *
 * The region/i18n flows are the same components at every width, so re-running
 * them here would only re-test the desktop suite through a smaller window. What
 * *is* viewport-specific is the drawer navigation, the overlay widths and the
 * horizontal overflow risk — that is what this file covers.
 */
test.describe("mobile", () => {
  test("menu opens, navigates and closes", async ({ freshPage: page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^menu$/i }).click();
    const menu = page.getByRole("dialog", { name: /^menu$/i });
    await expect(menu).toBeVisible();

    await menu.getByRole("link", { name: /^women$/i }).click();
    await expect(page).toHaveURL(/\/collections\/women$/);
    // The drawer is hidden with transform + inert, not display:none, so assert
    // the attribute rather than visibility (Playwright ignores opacity).
    await expect(page.getByRole("dialog", { name: /^menu$/i })).toHaveAttribute("inert", "");
  });

  test("no horizontal overflow on any key page", async ({ freshPage: page }) => {
    for (const path of ["/", "/collections/women", "/products/wool-overcoat", "/cart", "/wishlist", "/search?q=wool"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows at 390px`).toBeLessThanOrEqual(1);
    }
  });

  test("add to bag works and the drawer fits the screen", async ({ freshPage: page }) => {
    await page.goto("/products/fluid-cotton-tee");
    await page.getByRole("button", { name: "S", exact: true }).first().click();
    await page.getByRole("button", { name: /add(ed)? to bag/i }).click();

    const drawer = page.getByRole("dialog", { name: /shopping bag/i });
    await expect(drawer).toBeVisible();

    const box = await drawer.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(390);
    expect(box?.width ?? 0).toBeGreaterThan(300);
  });

  test("product card quick add reaches the bag", async ({ freshPage: page }) => {
    await page.goto("/collections/women");

    const card = page.locator("article").first();
    await card.getByRole("button", { name: /quick add/i }).click();
    await card.getByRole("button", { name: "S", exact: true }).click();

    await expect(page.getByRole("dialog", { name: /shopping bag/i })).toBeVisible();
  });
});
