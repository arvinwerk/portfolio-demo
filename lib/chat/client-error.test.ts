import { describe, expect, it } from "vitest";
import { readableChatError } from "./client-error";

describe("readableChatError", () => {
  it("haalt de fouttekst uit een JSON-antwoord", async () => {
    const response = await readableChatError(Response.json({ error: "Zet AI_MODEL en AI_API_KEY." }, { status: 503 }));

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toBe("Zet AI_MODEL en AI_API_KEY.");
  });

  it("laat een geslaagde stream ongemoeid", async () => {
    const response = new Response("data: hallo", { status: 200 });
    await expect(readableChatError(response)).resolves.toBe(response);
  });
});
