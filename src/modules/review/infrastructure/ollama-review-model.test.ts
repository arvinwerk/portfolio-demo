import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ReviewModelError } from "../domain/ports";
import { createOllamaReviewModel, readOllamaTarget, ReviewConfigError } from "./ollama-review-model";

describe("readOllamaTarget", () => {
  it("kiest lokale Qwen en weigert een sleutel in het adres", () => {
    expect(readOllamaTarget({})).toEqual({ baseUrl: "http://127.0.0.1:11434", model: "qwen" });
    expect(readOllamaTarget({ OLLAMA_URL: "http://127.0.0.1:11434/", QWEN_MODEL: "qwen2.5:3b" })).toEqual({
      baseUrl: "http://127.0.0.1:11434",
      model: "qwen2.5:3b",
    });
    expect(() => readOllamaTarget({ OLLAMA_URL: "http://user:secret@127.0.0.1:11434" })).toThrow(ReviewConfigError);
    expect(() => readOllamaTarget({ QWEN_MODEL: "qwen?token=geheim" })).toThrow(ReviewConfigError);
    expect(readOllamaTarget({ OLLAMA_URL: "http://qwen:11434/" }).baseUrl).toBe("http://qwen:11434");
    expect(() => readOllamaTarget({ OLLAMA_URL: "https://example.com" })).toThrow("OLLAMA_URL wijst niet naar een lokaal model.");
    expect(() => readOllamaTarget({ OLLAMA_URL: "niet een url" })).toThrow("OLLAMA_URL is ongeldig.");
  });
});

describe("createOllamaReviewModel", () => {
  it("stuurt het modelnaam zonder sleutel en leest het antwoord", async () => {
    const calls: { url: string; body: string }[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push({ url: String(input), body: String(init?.body) });
      return new Response(JSON.stringify({ message: { content: "- Houd de kop kort" } }), { status: 200 });
    };

    const text = await createOllamaReviewModel({ baseUrl: "http://127.0.0.1:11434", model: "qwen" }, fetchImpl).complete(
      "beoordeel de pagina",
    );

    expect(text).toBe("- Houd de kop kort");
    expect(calls[0]?.url).toBe("http://127.0.0.1:11434/api/chat");
    expect(calls[0]?.body).toContain('"model":"qwen"');
    expect(calls[0]?.body).not.toMatch(/api[_-]?key/i);
  });

  it("verbergt een providerfout", async () => {
    const fetchImpl: typeof fetch = async () => new Response("interne fout met geheim", { status: 500 });
    await expect(
      createOllamaReviewModel({ baseUrl: "http://127.0.0.1:11434", model: "qwen" }, fetchImpl).complete("brief"),
    ).rejects.toBeInstanceOf(ReviewModelError);
  });
});
