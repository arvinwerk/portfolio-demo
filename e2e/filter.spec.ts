import { expect, type Page, test } from "@playwright/test";
import { ORIGIN, pageUrl, portfolio } from "./helpers/content";
import { documentRemains, gotoPortfolio, keywordFilter, markDocument, scrollY } from "./helpers/page";

const TITLES = portfolio.projects.map((project) => project.title);
const KEYWORDS = ["Alles", "Angular", "Laravel", "NodeJS", "PHP", "Ionic"] as const;
const ANGULAR = [
  "Metacom Calculatie",
  "Lead Angular developer",
  "Vrienden van Amstel VIP 2024",
  "App voor infrarood ticketscanner",
  "Interne profielenpagina",
  "Welkomsscherm na inchecken ticket",
  "Urenregistratie",
  "Swipe & Shop app",
  "Rooster generator",
  "Backoffice en dynamische registratie voor we-invite",
];
const LARAVEL = [
  "Vrienden van Amstel VIP 2024",
  "Placeertool en uitnodigingen",
  "Rooster generator",
  "Backoffice en dynamische registratie voor we-invite",
];
const NODE = ["Microservice / middleware", "Interne profielenpagina"];
const PHP = ["Swipe & Shop app", "Rooster generator", "Backoffice en dynamische registratie voor we-invite"];
const LARAVEL_OR_NODE = [
  "Vrienden van Amstel VIP 2024",
  "Placeertool en uitnodigingen",
  "Microservice / middleware",
  "Interne profielenpagina",
  "Rooster generator",
  "Backoffice en dynamische registratie voor we-invite",
];
const LARAVEL_OR_PHP = [
  "Vrienden van Amstel VIP 2024",
  "Placeertool en uitnodigingen",
  "Swipe & Shop app",
  "Rooster generator",
  "Backoffice en dynamische registratie voor we-invite",
];
const ANGULAR_OR_NODE = [
  "Metacom Calculatie",
  "Lead Angular developer",
  "Vrienden van Amstel VIP 2024",
  "App voor infrarood ticketscanner",
  "Microservice / middleware",
  "Interne profielenpagina",
  "Welkomsscherm na inchecken ticket",
  "Urenregistratie",
  "Swipe & Shop app",
  "Rooster generator",
  "Backoffice en dynamische registratie voor we-invite",
];

function workHtml(html: string): string {
  const start = html.indexOf('id="werk"');
  const end = html.indexOf('id="contact"');
  return html.slice(start, end === -1 ? undefined : end);
}

function projectTitlesIn(html: string): string[] {
  return [...workHtml(html).matchAll(/<h3\b[^>]*>([^<]*)<\/h3>/g)]
    .map((match) => (match[1] ?? "").replaceAll("&amp;", "&").trim())
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
    { path: "/?keywords=PHP", titles: PHP },
    { path: "/?keywords=NodeJS", titles: NODE },
    { path: "/?keywords=Laravel&keywords=NodeJS", titles: LARAVEL_OR_NODE },
    { path: "/?keywords=Laravel,NodeJS", titles: LARAVEL_OR_NODE },
    { path: "/?keywords=Onbekend", titles: TITLES },
    { path: "/?keywords=angular", titles: TITLES },
    { path: "/?keywords=Onbekend&keywords=NodeJS", titles: NODE },
    { path: "/?keywords=%20PHP%20", titles: PHP },
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
    { path: "/?keywords=PHP", titles: PHP, current: ["PHP"] },
    { path: "/?keywords=Laravel", titles: LARAVEL, current: ["Laravel"] },
    { path: "/?keywords=Angular&keywords=NodeJS", titles: ANGULAR_OR_NODE, current: ["Angular", "NodeJS"] },
    { path: "/?keywords=Laravel,%20NodeJS", titles: LARAVEL_OR_NODE, current: ["Laravel", "NodeJS"] },
    { path: "/?keywords=Onbekend", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=angular", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=Onbekend&keywords=PHP", titles: PHP, current: ["PHP"] },
    { path: "/?keywords=PHP&keywords=PHP", titles: PHP, current: ["PHP"] },
    { path: "/?keywords=", titles: TITLES, current: ["Alles"] },
    { path: "/?keywords=%20PHP%20", titles: PHP, current: ["PHP"] },
  ];

  for (const example of cases) {
    test(example.path || "/", async ({ page }) => {
      await gotoPortfolio(page, example.path);
      await expectProjects(page, example.titles);
      await expectCurrent(page, example.current);
    });
  }

  test("een hash op werk opent bij de lijst", async ({ page }) => {
    await gotoPortfolio(page, "/?keywords=PHP#werk");
    await expectProjects(page, PHP);
    await expect(page.getByRole("heading", { name: "Werkervaring" })).toBeInViewport();
  });

  test("dezelfde selectie zonder hash blijft bovenaan", async ({ page }) => {
    await gotoPortfolio(page, "/?keywords=PHP");
    await expectProjects(page, PHP);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await expect(page.getByRole("heading", { name: "Werkervaring" })).not.toBeInViewport();
  });

  test("een gedeelde URL opent dezelfde selectie in een nieuw tabblad", async ({ page }) => {
    await gotoPortfolio(page, "/?keywords=NodeJS#werk");
    const second = await page.context().newPage();
    await second.goto(page.url());
    await expectProjects(second, NODE);
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

  await filter.getByRole("link", { name: "PHP", exact: true }).click();

  await expect(page).toHaveURL(pageUrl("/?keywords=PHP#werk"));
  await expectProjects(page, PHP);
  await expectCurrent(page, ["PHP"]);
  expect(await scrollY(page)).toBe(before);
  await documentRemains(page);
  await expect(page.getByRole("heading", { name: "Swipe & Shop app" })).toBeVisible();
});

test("meerdere trefwoorden zijn een OF-filter en Alles wist de selectie", async ({ page }) => {
  await gotoPortfolio(page);
  const filter = keywordFilter(page);
  await filter.getByRole("link", { name: "Angular", exact: true }).click();
  await filter.getByRole("link", { name: "NodeJS", exact: true }).click();

  await expect(page).toHaveURL(pageUrl("/?keywords=Angular&keywords=NodeJS#werk"));
  await expectProjects(page, ANGULAR_OR_NODE);
  await expectCurrent(page, ["Angular", "NodeJS"]);

  await filter.getByRole("link", { name: "NodeJS", exact: true }).click();
  await expect(page).toHaveURL(pageUrl("/?keywords=Angular#werk"));
  await expectProjects(page, ANGULAR);

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

  await filter.getByRole("link", { name: "NodeJS", exact: true }).click();
  await expect(filter.getByRole("link", { name: "NodeJS", exact: true })).toHaveAttribute("href", "/#werk");
  await expect(filter.getByRole("link", { name: "SailsJS", exact: true })).toHaveAttribute(
    "href",
    "/?keywords=NodeJS&keywords=SailsJS#werk",
  );

  const profilePage = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Interne profielenpagina" }) });
  await expect(profilePage.getByRole("link", { name: "NodeJS", exact: true })).toHaveAttribute("aria-current", "true");
  const sails = profilePage.getByRole("link", { name: "SailsJS", exact: true });
  await expect(sails).toHaveAttribute("href", "/?keywords=NodeJS&keywords=SailsJS#werk");
  await sails.click();

  await expect(page).toHaveURL(pageUrl("/?keywords=NodeJS&keywords=SailsJS#werk"));
  await expectProjects(page, NODE);
});

test("Enter op een trefwoord filtert hetzelfde als een klik", async ({ page }) => {
  await gotoPortfolio(page);
  const php = keywordFilter(page).getByRole("link", { name: "PHP", exact: true });
  await php.focus();
  await php.press("Enter");
  await expect(page).toHaveURL(pageUrl("/?keywords=PHP#werk"));
  await expectProjects(page, PHP);
});

test("de terugknop herstelt de vorige selectie", async ({ page }) => {
  await gotoPortfolio(page);
  await markDocument(page);
  const filter = keywordFilter(page);
  await filter.getByRole("link", { name: "Laravel", exact: true }).click();
  await filter.getByRole("link", { name: "PHP", exact: true }).click();
  await expect(page).toHaveURL(pageUrl("/?keywords=Laravel&keywords=PHP#werk"));
  await expectProjects(page, LARAVEL_OR_PHP);

  await page.goBack();
  await expect(page).toHaveURL(pageUrl("/?keywords=Laravel#werk"));
  await expectProjects(page, LARAVEL);
  await expectCurrent(page, ["Laravel"]);

  await page.goForward();
  await expectProjects(page, LARAVEL_OR_PHP);

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
    await keywordFilter(page).getByRole("link", { name: "PHP", exact: true }).click();
    await expect(page).toHaveURL(pageUrl("/?keywords=PHP#werk"));
    await expectProjects(page, PHP);
    await expectCurrent(page, ["PHP"]);
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
    await expectProjects(page, LARAVEL);
    await documentRemains(page);
  });
});
