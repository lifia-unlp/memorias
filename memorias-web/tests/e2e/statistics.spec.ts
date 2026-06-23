import { test, expect } from "@playwright/test";

test.describe("Reports Statistics Page Security & Layout", () => {
  
  test("should redirect unauthenticated users to the sign-in page", async ({ page }) => {
    // 1. Try to navigate to statistics directly
    await page.goto("/reports/statistics");
    
    // 2. Expect the middleware to intercept and redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/);
    
    // 3. Verify sign-in page structure
    const backdoorButton = page.getByRole("button", { name: "Dev Backdoor Login" });
    await expect(backdoorButton).toBeVisible();
  });

  test("should render the full statistics dashboard when authenticated", async ({ page }) => {
    // 1. Go to the sign-in page
    await page.goto("/auth/signin");
    
    // 2. Log in using the Development Backdoor
    const backdoorButton = page.getByRole("button", { name: "Dev Backdoor Login" });
    await expect(backdoorButton).toBeVisible();
    await backdoorButton.click();
    
    // 3. Verify we logged in successfully and are at the homepage or default redirect
    await expect(page).toHaveURL("/");
    
    // 4. Navigate to the statistics page
    await page.goto("/reports/statistics");
    await expect(page).toHaveURL("/reports/statistics");
    
    // 5. Verify Hero Banner & Title are visible
    const heroBanner = page.locator('[data-component-semantics="Hero banner"]');
    await expect(heroBanner).toBeVisible();
    
    const heroTitle = page.locator('[data-component-semantics="Hero title"]');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText("Statistics and Analytics");
    
    // 6. Verify Statistics Dashboard (KPIs, Tabs) is loaded
    const dashboard = page.locator('[data-component-semantics="Statistics dashboard"]');
    await expect(dashboard).toBeVisible();
    
    // 7. Verify that KPI summary cards are rendered
    await expect(page.locator('text="Recent Publications"')).toBeVisible();
    await expect(page.locator('text="Active Projects"')).toBeVisible();
    await expect(page.locator('text="Active Theses"')).toBeVisible();
    await expect(page.locator('text="Active Lab Members"')).toBeVisible();
    
    // 7b. Verify that Copilot dropdown menu option is present when COPILOT_URL is configured
    const reportsMenuTrigger = page.getByRole("button", { name: "Reports" });
    await expect(reportsMenuTrigger).toBeVisible();
    await reportsMenuTrigger.click();
    
    const copilotOption = page.getByRole("menuitem", { name: "Copilot" });
    await expect(copilotOption).toBeVisible();
    await expect(copilotOption).toHaveAttribute("target", "_blank");
    await expect(copilotOption).toHaveAttribute("href", process.env.COPILOT_URL || "http://localhost:3001");
    
    // Close reports menu
    await page.keyboard.press("Escape");
    
    // 8. Verify the first tab contains the Qualifications and Seniority Chart component
    const seniorityChart = page.locator('[data-component-semantics="Qualifications and seniority chart"]');
    await expect(seniorityChart).toBeVisible();
    
    // 9. Switch tabs to verify other charts (Scientific Production)
    const productionTab = page.getByRole("tab", { name: "Scientific Production" });
    await expect(productionTab).toBeVisible();
    await productionTab.click();
    
    const productionChart = page.locator('[data-component-semantics="Scientific production chart"]');
    await expect(productionChart).toBeVisible();
    
    // 10. Switch tabs to verify Projects & Scholarships
    const projectsTab = page.getByRole("tab", { name: "Projects & Scholarships" });
    await expect(projectsTab).toBeVisible();
    await projectsTab.click();
    
    const projectsChart = page.locator('[data-component-semantics="Active projects chart"]');
    await expect(projectsChart).toBeVisible();
    
    const scholarshipsChart = page.locator('[data-component-semantics="Scholarships and grants chart"]');
    await expect(scholarshipsChart).toBeVisible();

    const fundingChart = page.locator('[data-component-semantics="Funding agency chart"]');
    await expect(fundingChart).toBeVisible();
  });
  
});
