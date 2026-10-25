import { expect, test } from "@playwright/test";

// Zelfde plafond als app/api/chat/route.ts. De controle zit vóór het model.
const MAX_BODY_BYTES = 96 * 1024;
const chatUrl = "http://127.0.0.1:3000/api/chat";

async function postRaw(body: string) {
  const response = await fetch(chatUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  return { status: response.status, json: (await response.json()) as { error?: string } };
}

test("ongeldige JSON wordt geweigerd", async () => {
  const response = await postRaw("{");
  expect(response.status).toBe(400);
  expect(response.json).toEqual({ error: "Ongeldig verzoek." });
});

test("een lege body wordt geweigerd", async () => {
  const response = await postRaw("");
  expect(response.status).toBe(400);
  expect(response.json).toEqual({ error: "Ongeldig verzoek." });
});

test("een body op de limiet is nog geen 413", async () => {
  const response = await postRaw("{".padEnd(MAX_BODY_BYTES, " "));
  expect(response.status).toBe(400);
  expect(response.json).toEqual({ error: "Ongeldig verzoek." });
});

test("een byte boven de limiet wordt geweigerd", async () => {
  const response = await postRaw("x".repeat(MAX_BODY_BYTES + 1));
  expect(response.status).toBe(413);
  expect(response.json).toEqual({ error: "Het verzoek is te groot." });
});

test("een vraag zonder model en sleutel geeft 503", async ({ request }) => {
  const response = await request.post("/api/chat", {
    data: {
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Hoi" }] }],
    },
  });
  expect(response.status()).toBe(503);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(await response.json()).toEqual({ error: "Zet AI_MODEL en AI_API_KEY." });
});

test("GET is niet toegestaan", async ({ request }) => {
  const response = await request.get("/api/chat");
  expect(response.status()).toBe(405);
});
