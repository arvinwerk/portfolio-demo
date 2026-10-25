import { expect, type Page, type Route } from "@playwright/test";

export const WELCOME_TEXT = "Hoi. Vraag gerust iets over dit portfolio.";

export const STREAM_HEADERS = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache",
  "x-vercel-ai-ui-message-stream": "v1",
};

type PostedMessage = {
  role?: string;
  parts?: { type?: string; text?: string }[];
};

export function sse(events: readonly unknown[]): string {
  return `${events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("")}data: [DONE]\n\n`;
}

export function assistantText(text: string, messageId = "antwoord"): string {
  const id = "tekst";
  return sse([
    { type: "start", messageId },
    { type: "start-step" },
    { type: "text-start", id },
    { type: "text-delta", id, delta: text },
    { type: "text-end", id },
    { type: "finish-step" },
    { type: "finish", finishReason: "stop" },
  ]);
}

export function profileLookup(): string {
  return sse([
    { type: "start", messageId: "zoeken" },
    { type: "start-step" },
    {
      type: "tool-input-available",
      toolCallId: "zoek-1",
      toolName: "searchProfile",
      input: { query: "opleiding" },
    },
    { type: "finish-step" },
    { type: "finish", finishReason: "tool-calls" },
  ]);
}

export function profileAnswer(text: string): string {
  const id = "tekst";
  return sse([
    { type: "start", messageId: "antwoord" },
    { type: "start-step" },
    {
      type: "tool-input-available",
      toolCallId: "zoek-1",
      toolName: "searchProfile",
      input: { query: "opleiding" },
    },
    {
      type: "tool-output-available",
      toolCallId: "zoek-1",
      output: { fragments: ["Voorbeeld Hogeschool"] },
    },
    { type: "finish-step" },
    { type: "start-step" },
    { type: "text-start", id },
    { type: "text-delta", id, delta: text },
    { type: "text-end", id },
    { type: "finish-step" },
    { type: "finish", finishReason: "stop" },
  ]);
}

export function streamError(errorText: string): string {
  return sse([
    { type: "start", messageId: "fout" },
    { type: "error", errorText },
  ]);
}

export function postedTexts(body: { messages?: PostedMessage[] }): string[] {
  return (body.messages ?? []).map((message) =>
    (message.parts ?? [])
      .flatMap((part) => (part.type === "text" && typeof part.text === "string" ? [part.text] : []))
      .join(""),
  );
}

export async function mockChat(page: Page, respond: (route: Route) => Promise<void>) {
  await page.route("**/api/chat", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await respond(route);
  });
}

export async function openChat(page: Page) {
  await page.getByRole("button", { name: "Chat openen" }).click();
  const dialog = page.getByRole("dialog", { name: "Chat" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Bericht" })).toBeFocused();
  return dialog;
}

export async function sendChat(dialog: ReturnType<Page["getByRole"]>, text: string) {
  const field = dialog.getByRole("textbox", { name: "Bericht" });
  await field.fill(text);
  await field.press("Enter");
}
