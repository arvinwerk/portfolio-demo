import { describe, expect, it } from "vitest";
import { MAX_CHAT_BODY_BYTES, readLimitedBody } from "./limited-body";

function requestWith(body: BodyInit | null, headers?: HeadersInit) {
  return new Request("http://localhost/api/chat", { method: "POST", body, headers });
}

describe("readLimitedBody", () => {
  it("leest een lichaam tot en met de grens", async () => {
    const exact = await readLimitedBody(requestWith("x".repeat(MAX_CHAT_BODY_BYTES)));
    expect(exact).toEqual({ ok: true, text: "x".repeat(MAX_CHAT_BODY_BYTES) });

    const empty = await readLimitedBody(requestWith(""));
    expect(empty).toEqual({ ok: true, text: "" });
  });

  it("kapt af zodra een byte over de grens binnenkomt", async () => {
    const oversized = await readLimitedBody(requestWith("x".repeat(MAX_CHAT_BODY_BYTES + 1)));
    expect(oversized).toEqual({ ok: false, status: 413, error: "Het verzoek is te groot." });
  });

  it("weigert een aangekondigde lengte boven de grens", async () => {
    const request = requestWith("kort", { "content-length": String(MAX_CHAT_BODY_BYTES + 1) });
    expect(await readLimitedBody(request)).toEqual({ ok: false, status: 413, error: "Het verzoek is te groot." });
  });

  it("weigert een lengte die geen aantal bytes is", async () => {
    const request = requestWith("kort", { "content-length": "veel" });
    expect(await readLimitedBody(request)).toEqual({ ok: false, status: 400, error: "Ongeldig verzoek." });
  });

  it("telt een stroom zonder lengtekop alsnog per chunk", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("x".repeat(MAX_CHAT_BODY_BYTES)));
        controller.enqueue(encoder.encode("x"));
        controller.close();
      },
    });
    const init: RequestInit & { duplex: "half" } = { method: "POST", body: stream, duplex: "half" };
    const request = new Request("http://localhost/api/chat", init);

    expect(await readLimitedBody(request)).toEqual({ ok: false, status: 413, error: "Het verzoek is te groot." });
  });
});
