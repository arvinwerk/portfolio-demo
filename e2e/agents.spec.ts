import { expect, test } from "@playwright/test";

test("de agentpagina toont de voorstellen", async ({ page }) => {
  await page.goto("/agents");

  await expect(page.getByRole("heading", { level: 1, name: "Dagelijkse voorstellen" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText("zonder sleutels of andere gevoelige gegevens")).toHaveCount(0);

  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/AI_API_KEY|BEGIN PRIVATE KEY|sk-ant-|\/home\//);

  await page.getByRole("link", { name: "Portfolio", exact: true }).click();
  await expect(page).toHaveURL("/");
});
