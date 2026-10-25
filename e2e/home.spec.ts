import { expect, test } from "@playwright/test";
import { portfolio } from "./helpers/content";
import { gotoPortfolio } from "./helpers/page";

const { personal, skills, projects, banners, age, yearsAsDeveloper } = portfolio;

const categoryLabels = [
  ["skills", "Professional"],
  ["framework", "Frameworks"],
  ["other", "Other"],
] as const;

test.beforeEach(async ({ page }) => {
  await gotoPortfolio(page);
});

test("zet taal, titel en een niet-geïndexeerde omschrijving", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page).toHaveTitle(`${personal.fullName} — ${personal.function}`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    `${personal.function}. Werk, vaardigheden en een chat die het profiel doorzoekt.`,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("de skiplink brengt de focus naar de inhoud", async ({ page }) => {
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Naar inhoud" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#inhoud$/);
  await expect(page.locator("main#inhoud")).toBeInViewport();
});

test("toont het profiel, de afgeleide feiten en de contactlinks", async ({ page }) => {
  const profile = page.getByRole("region", { name: "Profiel" });
  await expect(profile.getByRole("heading", { level: 1, name: personal.fullName })).toBeVisible();
  await expect(profile.getByText(personal.function)).toBeVisible();
  await expect(profile.getByText(personal.education)).toBeVisible();
  await expect(profile.getByText(personal.location)).toBeVisible();

  const facts = profile.locator("dl");
  await expect(facts.getByText(String(yearsAsDeveloper), { exact: true })).toBeVisible();
  await expect(facts.getByText("jaar ontwikkeling")).toBeVisible();
  await expect(facts.getByText(String(projects.length), { exact: true })).toBeVisible();
  await expect(facts.getByText(projects.length === 1 ? "project" : "projecten")).toBeVisible();
  await expect(facts.getByText(String(skills.length), { exact: true })).toBeVisible();
  await expect(facts.getByText(skills.length === 1 ? "vaardigheid" : "vaardigheden")).toBeVisible();

  await expect(profile.getByRole("link", { name: personal.email })).toHaveAttribute("href", `mailto:${personal.email}`);
  await expect(profile.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", personal.linkedIn);
  await expect(profile.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("target", "_blank");
  await expect(profile.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", personal.github);
  await expect(profile.getByRole("link", { name: "example.com", exact: true })).toHaveAttribute(
    "href",
    personal.portfolioUrl,
  );

  const portrait = profile.getByRole("img", { name: `Monogram van ${personal.fullName}` });
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute("src", "/images/profile.svg");
});

test("vult leeftijd en jaren in het voorwoord in", async ({ page }) => {
  const about = page.getByRole("region", { name: "Over" });
  const paragraphs = personal.foreword
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => paragraph.replaceAll("${age}", String(age)).replaceAll("${yearsAsDeveloper}", String(yearsAsDeveloper)));

  for (const paragraph of paragraphs) {
    await expect(about.getByText(paragraph, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("${age}")).toHaveCount(0);
  await expect(page.getByText("${yearsAsDeveloper}")).toHaveCount(0);

  for (const paragraph of personal.githubDescription.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean)) {
    await expect(about.getByText(paragraph, { exact: true })).toBeVisible();
  }
  const code = about.getByRole("link", { name: "Code" });
  await expect(code).toHaveAttribute("href", personal.github);
  await expect(code).toHaveAttribute("target", "_blank");
  await expect(code).toHaveAttribute("rel", /noreferrer/);
});

test("toont de vaardigheden per categorie met balk en meter", async ({ page }) => {
  const section = page.getByRole("region", { name: "Vaardigheden" });
  const grouped = categoryLabels
    .map(([category, label]) => ({
      label,
      skills: skills.filter((skill) => skill.category === category),
    }))
    .filter((group) => group.skills.length > 0);

  await expect(section.getByRole("heading", { level: 3 })).toHaveText(grouped.map((group) => group.label));

  const meters = section.getByRole("meter");
  const expected = grouped.flatMap((group) => group.skills);
  await expect(meters).toHaveCount(expected.length);
  for (const [index, skill] of expected.entries()) {
    const meter = meters.nth(index);
    await expect(meter).toHaveAttribute("aria-label", skill.name);
    await expect(meter).toHaveAttribute("aria-valuemin", "0");
    await expect(meter).toHaveAttribute("aria-valuemax", "100");
    await expect(meter).toHaveAttribute("aria-valuenow", String(skill.percentage));
    await expect(meter).toHaveAttribute("aria-valuetext", `${skill.percentage}%`);
    await expect(meter.locator("span")).toHaveAttribute("style", new RegExp(`width:\\s*${skill.percentage}%`));
    await expect(section.getByText(`${skill.percentage}%`)).toBeVisible();
  }
});

test("toont de campagnes met laptop, telefoon en achtergrond", async ({ page }) => {
  for (const banner of banners) {
    const region = page.getByRole("region", { name: banner.title });
    await expect(region.getByRole("heading", { name: banner.title })).toBeVisible();
    await expect(region).toHaveCSS("background-image", new RegExp(banner.bgImage.src.replaceAll(".", "\\.")));
    await expect(region.getByRole("img", { name: `Laptopweergave van ${banner.title}` })).toHaveAttribute(
      "src",
      banner.laptopImage.src,
    );
    await expect(region.getByRole("img", { name: `Telefoonweergave van ${banner.title}` })).toHaveAttribute(
      "src",
      banner.mobileImage.src,
    );
  }
});

test("toont alle projecten in bestandsvolgorde", async ({ page }) => {
  const articles = page.locator("#werk article");
  await expect(articles).toHaveCount(projects.length);
  for (const [index, project] of projects.entries()) {
    const article = articles.nth(index);
    await expect(article.getByRole("heading", { name: project.title })).toBeVisible();
    await expect(article.getByText(project.company, { exact: true })).toBeVisible();
    await expect(article.getByText(project.shortDescription, { exact: true })).toBeVisible();
    await expect(article.locator("span").first()).toHaveText(String(index + 1).padStart(2, "0"));
    if (project.images[0]) {
      await expect(article.getByRole("img", { name: `Merkteken van ${project.company}` })).toHaveAttribute(
        "src",
        `/images/logos/${project.images[0]}`,
      );
    }
  }
});

test("de beelden uit de content zijn bereikbaar", async ({ request }) => {
  const paths = [
    "/images/profile.svg",
    ...banners.flatMap((banner) => [banner.bgImage.src, banner.laptopImage.src, banner.mobileImage.src]),
    ...projects.flatMap((project) => project.images.map((image) => `/images/logos/${image}`)),
  ];
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(await response.text()).toContain("<svg");
  }
});

test("de sectielinks en de naam gaan naar het juiste anker", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "Secties" });
  await expect(nav.getByRole("link", { name: "Over", exact: true })).toHaveAttribute("href", "#over");
  await expect(nav.getByRole("link", { name: "Skills", exact: true })).toHaveAttribute("href", "#skills");
  await expect(nav.getByRole("link", { name: "Werk", exact: true })).toHaveAttribute("href", "#werk");
  await expect(nav.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute("href", "#contact");

  await nav.getByRole("link", { name: "Skills", exact: true }).click();
  await expect(page).toHaveURL(/#skills$/);
  await expect(page.getByRole("heading", { name: "Vaardigheden" })).toBeInViewport();

  await nav.getByRole("link", { name: "Werk", exact: true }).click();
  await expect(page).toHaveURL(/#werk$/);
  await expect(page.getByRole("heading", { name: "Werkervaring" })).toBeInViewport();

  await nav.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByRole("contentinfo")).toBeInViewport();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("link", { name: personal.fullName, exact: true }).click();
  await expect(page).toHaveURL(/#top$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
});

test("de footer herhaalt naam en contact", async ({ page }) => {
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText(personal.fullName, { exact: true })).toBeVisible();
  await expect(footer.getByText(`Gemaakt door ${personal.fullName}`)).toBeVisible();
  await expect(footer.getByRole("link", { name: personal.email })).toHaveAttribute("href", `mailto:${personal.email}`);
  await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", personal.linkedIn);
  await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", personal.github);
  await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute("rel", /noreferrer/);
});

test("een onbekend pad geeft 404", async ({ page }) => {
  const response = await page.goto("/dit-pad-bestaat-niet");
  expect(response?.status()).toBe(404);
});
