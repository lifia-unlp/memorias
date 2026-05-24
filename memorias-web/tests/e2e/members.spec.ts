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
});
