import { test as base, expect, type Page, type Locator } from "@playwright/test";

/**
 * Every test starts from a clean device, but only once: `addInitScript` runs on
 * every navigation, so an unguarded `localStorage.clear()` would wipe the bag
 * the moment a test navigates to /cart. The sessionStorage flag survives
 * same-tab navigations and makes the reset happen exactly once per test.
 */
export const test = base.extend<{ freshPage: Page }>({
  freshPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        if (!window.sessionStorage.getItem("aurel-e2e-reset")) {
          window.localStorage.clear();
          window.sessionStorage.setItem("aurel-e2e-reset", "1");
        }
      } catch {
        /* storage blocked — nothing to reset */
      }
    });
    await use(page);
  },
});

export { expect };

/**
 * The region selector is mounted twice (header chip and footer block), so two
 * dialogs exist in the DOM and both match by accessible name — Chromium still
 * exposes their `inert` subtrees to role queries. Visibility of the panel's
 * heading is the reliable signal: a closed panel is translated away on mobile and
 * at opacity 0 on desktop.
 *
 * These helpers drive the header instance, and are used by the desktop project.
 */
const regionHeading = (page: Page): Locator =>
  page.getByRole("heading", { name: /region & (currency|währung)/i }).first();

const regionPanel = (page: Page): Locator =>
  page.locator('[role="dialog"]').filter({ hasText: /Region & (currency|Währung)/ }).first();

export async function openRegionDialog(page: Page) {
  await page
    .locator("header")
    .getByRole("button", { name: /change region and currency/i })
    .click();
  await expect(regionHeading(page)).toBeVisible();
}

export async function chooseRegion(page: Page, country: string) {
  await openRegionDialog(page);
  await regionPanel(page).getByRole("button", { name: new RegExp(country, "i") }).click();
  await page.keyboard.press("Escape");
  await expect(regionPanel(page)).toHaveAttribute("inert", "");
}

export async function chooseLanguage(page: Page, label: "English" | "Deutsch") {
  await openRegionDialog(page);
  await regionPanel(page).getByRole("button", { name: label, exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(regionPanel(page)).toHaveAttribute("inert", "");
}

/** The label flips to "Added to bag" after the first add, so match both. */
export const addToBagButton = (page: Page) => page.getByRole("button", { name: /add(ed)? to bag/i });

export async function addFromProductPage(page: Page, size = "M") {
  await page.getByRole("button", { name: size, exact: true }).first().click();
  await addToBagButton(page).click();
  await expect(page.getByRole("dialog", { name: /shopping bag/i })).toBeVisible();
}

export async function openSearch(page: Page) {
  await page.getByRole("button", { name: /search products/i }).click();
  const input = page.locator("#site-search");
  await expect(input).toBeFocused();
  return input;
}
