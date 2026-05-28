import { test, expect } from "@playwright/test";

test.describe("Members Directory Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the members directory
    await page.goto("/members");
  });

  test("should render the page header, hero banner, and semantic elements", async ({ page }) => {
    // 1. Verify Hero banner component carrying semantic tag is present
    const heroBanner = page.locator('[data-component-semantics="Hero banner"]');
    await expect(heroBanner).toBeVisible();

    // 2. Verify Hero title carries the correct semantic annotation
    const heroTitle = page.locator('[data-component-semantics="Hero title"]');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText("Our Researchers");
  });

  test("should toggle the 'Hide former members' filter and update query parameters", async ({ page }) => {
    // 1. Check that the checkbox is present and checked by default
    const checkbox = page.locator('label:has-text("Hide former members") input[type="checkbox"]');
    await expect(checkbox).toBeChecked();

    // 2. Click the checkbox to uncheck it
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    // 3. Verify that the URL is updated with the hideFormer=false query parameter
    await expect(page).toHaveURL(/\/members\?.*hideFormer=false/);

    // 4. Click it again to check it
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 5. Verify that hideFormer parameter is removed from the URL (restored to default clean URL)
    await expect(page).not.toHaveURL(/hideFormer=false/);
  });

  test("should filter members directory using multi-word space-separated tokens", async ({ page }) => {
    // 1. Locate search input field
    const searchInput = page.locator('input[placeholder*="Search members"]');
    await expect(searchInput).toBeVisible();

    // 2. Type "Diego T" (matching "Diego Torres")
    await searchInput.fill("Diego T");

    // 3. Verify that the URL updates or the filtered member card is visible
    // Wait for the query parameter to update (debounce/transition)
    await page.waitForTimeout(500);

    // 4. Verify "Diego Torres" is visible
    const diegoCard = page.locator('text="Diego Torres"');
    await expect(diegoCard).toBeVisible();

    // 5. Verify that another researcher (e.g. any other seed member name not matching "Diego T") is not shown
    const otherCard = page.locator('text="Alice Smith"');
    await expect(otherCard).not.toBeVisible();
  });
});
