import { expect, type Page, test } from "@playwright/test";
import {
  assistantText,
  mockChat,
  openChat,
  postedTexts,
  profileAnswer,
  profileLookup,
  sendChat,
  STREAM_HEADERS,
  streamError,
  WELCOME_TEXT,
} from "./helpers/chat";
import { gotoPortfolio } from "./helpers/page";

const serverSentences = [
  { status: 400, error: "Een bericht is te lang." },
  { status: 400, error: "Dit gesprek is te lang. Begin opnieuw." },
  { status: 400, error: "Stuur een vraag." },
  { status: 400, error: "Ongeldig verzoek." },
  { status: 429, error: "Te veel berichten. Wacht even en probeer het opnieuw." },
  { status: 502, error: "Het antwoord lukte niet. Probeer het opnieuw." },
  { status: 413, error: "Het verzoek is te groot." },
] as const;

async function expectNoRequest(page: Page, action: () => Promise<void>) {
  const seen = page
    .waitForRequest((request) => request.url().includes("/api/chat") && request.method() === "POST", { timeout: 400 })
    .then(() => true, () => false);
  await action();
  expect(await seen).toBe(false);
}

test.describe("venster", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPortfolio(page);
  });

  test("opent met de welkomstzin en sluit via knop, escape en de ronde knop", async ({ page }) => {
    const opener = page.getByRole("button", { name: "Chat openen" });
    await expect(opener).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "Chat", exact: true })).toBeHidden();

    const dialog = await openChat(page);
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByRole("heading", { name: "Chat" })).toBeVisible();
    await expect(dialog.getByText("Antwoorden komen uit het profiel.")).toBeVisible();
    await expect(dialog.getByText(WELCOME_TEXT, { exact: true })).toBeVisible();
    await expect(dialog.getByText(WELCOME_TEXT, { exact: true })).not.toHaveClass(/ml-auto/);
    await expect(dialog.getByRole("textbox", { name: "Bericht" })).toHaveAttribute("placeholder", "Stel een vraag");
    await expect(page.getByRole("button", { name: "Chat sluiten" })).toHaveAttribute("aria-expanded", "true");

    await dialog.getByRole("button", { name: "Sluiten" }).click();
    await expect(dialog).toBeHidden();

    await openChat(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await opener.click();
    await page.getByRole("button", { name: "Chat sluiten" }).click();
    await expect(page.getByRole("button", { name: "Chat openen" })).toHaveAttribute("aria-expanded", "false");
  });

  test("een leeg of wit bericht gaat niet naar de server", async ({ page }) => {
    const dialog = await openChat(page);
    const field = dialog.getByRole("textbox", { name: "Bericht" });

    await expectNoRequest(page, async () => {
      await dialog.getByRole("button", { name: "Verstuur" }).click();
    });
    await expect(dialog.getByText(WELCOME_TEXT)).toBeVisible();

    await field.fill("   ");
    await expectNoRequest(page, async () => {
      await dialog.getByRole("button", { name: "Verstuur" }).click();
    });
    await expect(field).toHaveValue("   ");
  });

  test("Shift+Enter voegt een regel toe en verstuurt niet", async ({ page }) => {
    const dialog = await openChat(page);
    const field = dialog.getByRole("textbox", { name: "Bericht" });
    await field.fill("eerste");
    await expectNoRequest(page, async () => {
      await field.press("Shift+Enter");
    });
    await expect(field).toHaveValue(/eerste\n/);
  });

  test("een vraag zonder configuratie toont de zin en niet de JSON", async ({ page }) => {
    let calls = 0;
    await mockChat(page, async (route) => {
      calls += 1;
      await route.continue();
    });
    const dialog = await openChat(page);
    await dialog.getByRole("textbox", { name: "Bericht" }).fill("Wie ben je?");
    await dialog.getByRole("button", { name: "Verstuur" }).click();

    await expect(dialog.getByText("Wie ben je?", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Wie ben je?", { exact: true })).toHaveClass(/ml-auto/);
    await expect(dialog.getByText("Zet AI_MODEL en AI_API_KEY.", { exact: true })).toBeVisible();
    await expect(dialog.getByText('{"error"')).toHaveCount(0);
    await expect(dialog.getByRole("textbox", { name: "Bericht" })).toHaveValue("");
    await expect(dialog.getByText(WELCOME_TEXT)).toBeVisible();

    await sendChat(dialog, "En je opleiding?");
    await expect(dialog.getByText("En je opleiding?", { exact: true })).toBeVisible();
    expect(calls).toBe(2);
  });

  test("een antwoord blijft staan als het venster dicht en weer open gaat", async ({ page }) => {
    await mockChat(page, async (route) => {
      await route.fulfill({ status: 200, headers: STREAM_HEADERS, body: assistantText("Ik ben een demo.") });
    });
    const dialog = await openChat(page);
    await sendChat(dialog, "Wie ben je?");
    await expect(dialog.getByText("Ik ben een demo.", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Ik ben een demo.", { exact: true })).not.toHaveClass(/ml-auto/);

    await page.keyboard.press("Escape");
    await openChat(page);
    await expect(page.getByRole("dialog").getByText("Ik ben een demo.", { exact: true })).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Wie ben je?", { exact: true })).toBeVisible();
  });

  test("een vervolgvraag stuurt het hele gesprek mee", async ({ page }) => {
    const bodies: { messages?: { parts?: { type?: string; text?: string }[] }[] }[] = [];
    await mockChat(page, async (route) => {
      bodies.push(route.request().postDataJSON());
      const text = bodies.length === 1 ? "Eerste antwoord." : "Tweede antwoord.";
      await route.fulfill({
        status: 200,
        headers: STREAM_HEADERS,
        body: assistantText(text, `antwoord-${bodies.length}`),
      });
    });
    const dialog = await openChat(page);
    await sendChat(dialog, "Eerste vraag");
    await expect(dialog.getByText("Eerste antwoord.", { exact: true })).toBeVisible();
    await sendChat(dialog, "Tweede vraag");
    await expect(dialog.getByText("Tweede antwoord.", { exact: true })).toBeVisible();

    expect(postedTexts(bodies[1] ?? {})).toEqual([WELCOME_TEXT, "Eerste vraag", "Eerste antwoord.", "Tweede vraag"]);
  });

  test("toont dat het profiel wordt doorzocht zolang de tool geen resultaat heeft", async ({ page }) => {
    await mockChat(page, async (route) => {
      await route.fulfill({ status: 200, headers: STREAM_HEADERS, body: profileLookup() });
    });
    const dialog = await openChat(page);
    await sendChat(dialog, "Welke opleiding?");
    await expect(dialog.getByText("Ik zoek in het profiel.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Verstuur" })).toBeVisible();
  });

  test("verbergt het zoeken zodra het antwoord uit het profiel er is", async ({ page }) => {
    await mockChat(page, async (route) => {
      await route.fulfill({
        status: 200,
        headers: STREAM_HEADERS,
        body: profileAnswer("De opleiding staat in het profiel."),
      });
    });
    const dialog = await openChat(page);
    await sendChat(dialog, "Welke opleiding?");
    await expect(dialog.getByText("De opleiding staat in het profiel.", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Ik zoek in het profiel.")).toHaveCount(0);
  });

  test("een fout in de stream toont de vaste zin", async ({ page }) => {
    await mockChat(page, async (route) => {
      await route.fulfill({
        status: 200,
        headers: STREAM_HEADERS,
        body: streamError("Het antwoord lukte niet. Probeer het opnieuw."),
      });
    });
    const dialog = await openChat(page);
    await sendChat(dialog, "Hoi");
    await expect(dialog.getByText("Het antwoord lukte niet. Probeer het opnieuw.", { exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Verstuur" })).toBeVisible();
  });

  for (const sentence of serverSentences) {
    test(`toont "${sentence.error}" bij status ${sentence.status}`, async ({ page }) => {
      await mockChat(page, async (route) => {
        await route.fulfill({
          status: sentence.status,
          contentType: "application/json",
          body: JSON.stringify({ error: sentence.error }),
        });
      });
      const dialog = await openChat(page);
      await sendChat(dialog, "Hoi");
      await expect(dialog.getByText(sentence.error, { exact: true })).toBeVisible();
      await expect(dialog.getByText('{"error"')).toHaveCount(0);
      await expect(dialog.getByText("Hoi", { exact: true })).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Verstuur" })).toBeVisible();
    });
  }

  test("Stop breekt het antwoord af en een tweede enter wacht", async ({ page }) => {
    let calls = 0;
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    await mockChat(page, async (route) => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      try {
        await route.fulfill({ status: 200, headers: STREAM_HEADERS, body: assistantText("Te laat.") });
      } catch {
        // Het verzoek is afgebroken.
      } finally {
        finish();
      }
    });

    const dialog = await openChat(page);
    const field = dialog.getByRole("textbox", { name: "Bericht" });
    await field.fill("Wie ben je?");
    await field.press("Enter");
    const stop = dialog.getByRole("button", { name: "Stop" });
    await expect(stop).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Verstuur" })).toHaveCount(0);
    await field.fill("nog een");
    await field.press("Enter");
    await expect(field).toHaveValue("nog een");
    await stop.click();
    await finished;
    expect(calls).toBe(1);
    await expect(field).toHaveValue("nog een");
    await expect(dialog.getByText("Wie ben je?", { exact: true })).toBeVisible();
    await expect(dialog.locator("p", { hasText: "nog een" })).toHaveCount(0);
    await expect(dialog.getByText("Te laat.")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Verstuur" })).toBeVisible();
    await expect(dialog.getByText("Zet AI_MODEL en AI_API_KEY.")).toHaveCount(0);
  });
});

test.describe("onder de sm-grens", () => {
  test.use({ viewport: { width: 639, height: 844 } });

  test("de kop opent de chat en de ronde knop is weg", async ({ page }) => {
    await gotoPortfolio(page);
    await expect(page.getByRole("button", { name: "Chat openen" })).toBeHidden();
    const header = page.getByRole("button", { name: "Chat", exact: true });
    await expect(header).toBeVisible();
    await header.click();
    const dialog = page.getByRole("dialog", { name: "Chat" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Bericht" })).toBeFocused();
    await header.click();
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.width).toBeLessThanOrEqual(639);

    await sendChat(dialog, "Hoi");
    await expect(dialog.getByText("Zet AI_MODEL en AI_API_KEY.", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("vanaf de sm-grens", () => {
  test.use({ viewport: { width: 640, height: 800 } });

  test("de ronde knop neemt het over van de kop", async ({ page }) => {
    await gotoPortfolio(page);
    await expect(page.getByRole("button", { name: "Chat", exact: true })).toBeHidden();
    await openChat(page);
    await expect(page.getByRole("dialog", { name: "Chat" })).toBeVisible();
  });
});
