import { test, expect } from "@playwright/test";

test.describe("Global Search Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the global search page
    await page.goto("/search");
  });

  test("should render search page elements and hero banner", async ({ page }) => {
    // Verify Hero banner component carrying semantic tag is present
    const heroBanner = page.locator('[data-component-semantics="Hero banner"]');
    await expect(heroBanner).toBeVisible();

    // Verify search input is present
    const searchInput = page.locator('input[placeholder*="Search across all records"]');
    await expect(searchInput).toBeVisible();
  });

  test("should filter results when query is submitted", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search across all records"]');
    await searchInput.fill("Diego");
    await page.keyboard.press("Enter");

    // Wait for the URL to update
    await expect(page).toHaveURL(/\/search\?.*q=Diego/);

    // Verify search results container or matching text is shown
    // We expect to find a member card with Diego Torres
    const resultCard = page.locator('text="Diego Torres"').first();
    await expect(resultCard).toBeVisible();
  });

  test("should update query parameters when category chips are clicked", async ({ page }) => {
    // Locate the category chips
    const chipAll = page.locator('a:has-text("All")');
    await expect(chipAll).toBeVisible();

    const chipMembers = page.locator('a:has-text("Researchers")');
    await expect(chipMembers).toBeVisible();
    await chipMembers.click();

    // Verify URL updates
    await expect(page).toHaveURL(/\/search\?.*type=member/);
  });
});
