import { describe, expect, it } from "vitest";
import { transcriptContext, transcriptSealPayload } from "./transcript-seal";

describe("transcriptSealPayload", () => {
  const context = transcriptContext([{ role: "user", id: "1", text: "Waar woon je?" }]);

  it("maakt een andere lading als de grens tussen id en tekst verschuift", () => {
    const text = "Ik woon\nin Kadewijk.";

    expect(transcriptSealPayload("antwoord-1", text, context)).not.toBe(
      transcriptSealPayload("antwoord-1\nIk woon", "in Kadewijk.", context),
    );
  });

  it("maakt een andere lading voor een andere voorgeschiedenis", () => {
    const other = transcriptContext([{ role: "user", id: "1", text: "Andere vraag" }]);

    expect(transcriptSealPayload("2", "Ja.", context)).not.toBe(transcriptSealPayload("2", "Ja.", other));
  });

  it("botst niet als een tekst de volgende beurt nabootst", () => {
    const spliced = transcriptContext([{ role: "user", id: "1", text: "x\nuser\n2\ny" }]);
    const separate = transcriptContext([
      { role: "user", id: "1", text: "x" },
      { role: "user", id: "2", text: "y" },
    ]);

    expect(spliced).not.toBe(separate);
  });
});
