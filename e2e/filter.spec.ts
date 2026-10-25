import { expect, type Page, test } from "@playwright/test";
import { ORIGIN, pageUrl, portfolio } from "./helpers/content";
import { documentRemains, gotoPortfolio, keywordFilter, markDocument, scrollY } from "./helpers/page";

const TITLES = portfolio.projects.map((project) => project.title);
const KEYWORDS = ["Alles", "Angular", "TypeScript", "Laravel", "React", "Node.js"] as const;

function workHtml(html: string): string {
  const start = html.indexOf('id="werk"');
  const end = html.indexOf('id="contact"');
  return html.slice(start, end === -1 ? undefined : end);
}

function projectTitlesIn(html: string): string[] {
  return [...workHtml(html).matchAll(/<h3\b[^>]*>([^<]*)<\/h3>/g)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((title) => TITLES.includes(title));
}

async function expectProjects(page: Page, titles: string[]) {
  await expect(page.locator("#werk article h3")).toHaveText(titles);
}

async function expectCurrent(page: Page, current: readonly string[]) {
  const filter = keywordFilter(page);
  for (const name of KEYWORDS) {
    const link = filter.getByRole("link", { name, exact: true });
    if (current.includes(name)) {
      await expect(link).toHaveAttribute("aria-current", "true");
    } else {
      await expect(link).not.toHaveAttribute("aria-current");
    }
  }
}

test.describe("eerste HTML", () => {
  const cases = [
    { path: "/", titles: TITLES },
    { path: "/?keywords=React", titles: ["Componentbibliotheek"] },
    { path: "/?keywords=TypeScript", titles: ["VIP Arrangementen 2024", "Componentbibliotheek"] },
    { path: "/?keywords=Angular&keywords=React", titles: ["VIP Arrangementen 2024", "Formule 1 VIP", "Componentbibliotheek"] },
    { path: "/?keywords=Angular,React", titles: ["VIP Arrangementen 2024", "Formule 1 VIP", "Componentbibliotheek"] },
    { path: "/?keywords=Onbekend", titles: TITLES },
    { path: "/?keywords=angular", titles: TITLES },
    { path: "/?keywords=Onbekend&keywords=Node.js", titles: ["Content-API"] },
    { path: "/?keywords=%20React%20", titles: ["Componentbibliotheek"] },
  ];

  for (const example of cases) {
    test(`${example.path || "/"} levert de gefilterde titels`, async ({ request }) => {
      const response = await request.get(example.path);
      expect(response.status()).toBe(200);
      expect(projectTitlesIn(await response.text())).toEqual(example.titles);
    });
  }
});

test.describe("adresbalk", () => {
  const cases: { path: string; titles: string[]; current: string[] }[] = [
    { path: "/", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=React", titles: ["Componentbibliotheek"], current: ["React"] },
    { path: "/?keywords=Laravel", titles: ["Formule 1 VIP", "Content-API"], current: ["Laravel"] },
    {
      path: "/?keywords=Angular&keywords=Node.js",
      titles: ["VIP Arrangementen 2024", "Formule 1 VIP", "Content-API"],
      current: ["Angular", "Node.js"],
    },
    {
      path: "/?keywords=Angular,%20React",
      titles: ["VIP Arrangementen 2024", "Formule 1 VIP", "Componentbibliotheek"],
      current: ["Angular", "React"],
    },
    { path: "/?keywords=Onbekend", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=angular", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=Onbekend&keywords=React", titles: ["Componentbibliotheek"], current: ["React"] },
    { path: "/?keywords=React&keywords=React", titles: ["Componentbibliotheek"], current: ["React"] },
    { path: "/?keywords=", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=%20React%20", titles: ["Componentbibliotheek"], current: ["React"] },
  ];

  for (const example of cases) {
    test(example.path || "/", async ({ page }) => {
      await gotoPortfolio(page, example.path);
      await expectProjects(page, example.titles);
      await expectCurrent(page, example.current);
    });
  }

  test("een hash op werk opent bij de lijst", async ({ page }) => {
    await gotoPortfolio(page, "/?keywords=React#werk");
    await expectProjects(page, ["Componentbibliotheek"]);
    await expect(page.getByRole("heading", { name: "Werkervaring" })).toBeInViewport();
  });

  test("dezelfde selectie zonder hash blijft bovenaan", async ({ page }) => {
    await gotoPortfolio(page, "/?keywords=React");
    await expectProjects(page, ["Componentbibliotheek"]);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await expect(page.getByRole("heading", { name: "Werkervaring" })).not.toBeInViewport();
  });

  test("een gedeelde URL opent dezelfde selectie in een nieuw tabblad", async ({ page }) => {
    await gotoPortfolio(page, "/?keywords=Node.js#werk");
    const second = await page.context().newPage();
    await second.goto(page.url());
    await expectProjects(second, ["Content-API"]);
    await expect(second.getByRole("heading", { name: "Werkervaring" })).toBeInViewport();
    await second.close();
  });
});

test("een klik filtert in de pagina en laat de scrollpositie staan", async ({ page }) => {
  await gotoPortfolio(page);
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  const filter = keywordFilter(page);
  await filter.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 120));
  });
  const before = await scrollY(page);
  await markDocument(page);

  await filter.getByRole("link", { name: "React", exact: true }).click();

  await expect(page).toHaveURL(pageUrl("/?keywords=React#werk"));
  await expectProjects(page, ["Componentbibliotheek"]);
  await expectCurrent(page, ["React"]);
  expect(await scrollY(page)).toBe(before);
  await documentRemains(page);
  await expect(page.getByRole("img", { name: "Merkteken van Studio Noord" })).toHaveAttribute("src", "/images/logos/ui.svg");
});

test("meerdere trefwoorden zijn een OF-filter en Alles wist de selectie", async ({ page }) => {
  await gotoPortfolio(page);
  const filter = keywordFilter(page);
  await filter.getByRole("link", { name: "Angular", exact: true }).click();
  await filter.getByRole("link", { name: "Node.js", exact: true }).click();

  await expect(page).toHaveURL(pageUrl("/?keywords=Angular&keywords=Node.js#werk"));
  await expectProjects(page, ["VIP Arrangementen 2024", "Formule 1 VIP", "Content-API"]);
  await expectCurrent(page, ["Angular", "Node.js"]);

  await filter.getByRole("link", { name: "Node.js", exact: true }).click();
  await expect(page).toHaveURL(pageUrl("/?keywords=Angular#werk"));
  await expectProjects(page, ["VIP Arrangementen 2024", "Formule 1 VIP"]);

  await filter.getByRole("link", { name: "Alles", exact: true }).click();
  await expect(page).toHaveURL(pageUrl("/#werk"));
  await expectProjects(page, TITLES);
  await expectCurrent(page, ["Alles"]);
});

test("de href beschrijft de volgende selectie, ook op de kaart", async ({ page }) => {
  await gotoPortfolio(page);
  const filter = keywordFilter(page);
  await expect(filter.getByRole("link", { name: "Alles", exact: true })).toHaveAttribute("href", "/#werk");
  await expect(filter.getByRole("link", { name: "Laravel", exact: true })).toHaveAttribute("href", "/?keywords=Laravel#werk");

  await filter.getByRole("link", { name: "Angular", exact: true }).click();
  await expect(filter.getByRole("link", { name: "Angular", exact: true })).toHaveAttribute("href", "/#werk");
  await expect(filter.getByRole("link", { name: "TypeScript", exact: true })).toHaveAttribute(
    "href",
    "/?keywords=Angular&keywords=TypeScript#werk",
  );

  const vrienden = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "VIP Arrangementen 2024" }) });
  await expect(vrienden.getByRole("link", { name: "Angular", exact: true })).toHaveAttribute("aria-current", "true");
  const typescript = vrienden.getByRole("link", { name: "TypeScript", exact: true });
  await expect(typescript).toHaveAttribute("href", "/?keywords=Angular&keywords=TypeScript#werk");
  await typescript.click();

  await expect(page).toHaveURL(pageUrl("/?keywords=Angular&keywords=TypeScript#werk"));
  await expectProjects(page, ["VIP Arrangementen 2024", "Formule 1 VIP", "Componentbibliotheek"]);
});

test("Enter op een trefwoord filtert hetzelfde als een klik", async ({ page }) => {
  await gotoPortfolio(page);
  const react = keywordFilter(page).getByRole("link", { name: "React", exact: true });
  await react.focus();
  await react.press("Enter");
  await expect(page).toHaveURL(pageUrl("/?keywords=React#werk"));
  await expectProjects(page, ["Componentbibliotheek"]);
});

test("de terugknop herstelt de vorige selectie", async ({ page }) => {
  await gotoPortfolio(page);
  await markDocument(page);
  const filter = keywordFilter(page);
  await filter.getByRole("link", { name: "Laravel", exact: true }).click();
  await filter.getByRole("link", { name: "React", exact: true }).click();
  await expect(page).toHaveURL(pageUrl("/?keywords=Laravel&keywords=React#werk"));
  await expectProjects(page, ["Formule 1 VIP", "Componentbibliotheek", "Content-API"]);

  await page.goBack();
  await expect(page).toHaveURL(pageUrl("/?keywords=Laravel#werk"));
  await expectProjects(page, ["Formule 1 VIP", "Content-API"]);
  await expectCurrent(page, ["Laravel"]);

  await page.goForward();
  await expectProjects(page, ["Formule 1 VIP", "Componentbibliotheek", "Content-API"]);

  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(pageUrl("/"));
  await expectProjects(page, TITLES);
  await expectCurrent(page, ["Alles"]);
  await documentRemains(page);
});

test("zonder JavaScript volgt de href en filtert de server", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: ORIGIN,
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await keywordFilter(page).getByRole("link", { name: "React", exact: true }).click();
    await expect(page).toHaveURL(pageUrl("/?keywords=React#werk"));
    await expectProjects(page, ["Componentbibliotheek"]);
    await expectCurrent(page, ["React"]);
    await expect(page.getByRole("heading", { name: "Werkervaring" })).toBeInViewport();
  } finally {
    await context.close();
  }
});

test.describe("smal scherm", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("een trefwoord filtert ook als de chips omslaan", async ({ page }) => {
    await gotoPortfolio(page);
    await markDocument(page);
    await keywordFilter(page).getByRole("link", { name: "Laravel", exact: true }).click();
    await expect(page).toHaveURL(pageUrl("/?keywords=Laravel#werk"));
    await expectProjects(page, ["Formule 1 VIP", "Content-API"]);
    await documentRemains(page);
  });
});
