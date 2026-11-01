import { describe, expect, it } from "vitest";
import { refuseChatRequest } from "./chat-request";

function request(headers: Record<string, string>) {
  return new Request("http://localhost/api/chat", { method: "POST", headers, body: "{}" });
}

describe("refuseChatRequest", () => {
  it("laat een json-verzoek van dezelfde site door", () => {
    expect(refuseChatRequest(request({ "content-type": "application/json; charset=utf-8" }))).toBeUndefined();
    expect(
      refuseChatRequest(request({ "content-type": "application/json", "sec-fetch-site": "same-origin" })),
    ).toBeUndefined();
  });

  it("weigert een andere site en een body die geen json is", async () => {
    const crossSite = refuseChatRequest(
      request({ "content-type": "text/plain", "sec-fetch-site": "cross-site" }),
    );
    expect(crossSite?.status).toBe(403);
    expect(crossSite?.headers.get("cache-control")).toBe("no-store");

    const plain = refuseChatRequest(request({ "content-type": "text/plain" }));
    expect(plain?.status).toBe(415);
    await expect(plain?.json()).resolves.toEqual({ error: "Ongeldig verzoek." });
  });
});
