import { expect, type Page } from "@playwright/test";

export async function gotoPortfolio(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(() => {
    const button = document.querySelector("button[aria-expanded]");
    if (!button) {
      return false;
    }
    return Object.keys(button).some((key) => key.startsWith("__reactFiber") || key.startsWith("__reactProps"));
  });
}

export function keywordFilter(page: Page) {
  return page.getByRole("navigation", { name: "Filter op trefwoord" });
}

export async function scrollY(page: Page): Promise<number> {
  return page.evaluate(() => Math.round(window.scrollY));
}

export async function markDocument(page: Page) {
  await page.evaluate(() => {
    (window as Window & { __documentBlijft?: string }).__documentBlijft = "ja";
  });
}

export async function documentRemains(page: Page) {
  await expect.poll(() =>
    page.evaluate(() => (window as Window & { __documentBlijft?: string }).__documentBlijft ?? ""),
  ).toBe("ja");
}
