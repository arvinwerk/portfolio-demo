import { describe, expect, it } from "vitest";
import { chatTranscript } from "./chat-transcript";
import type { TranscriptTurn } from "./conversation";

const updatedAt = new Date("2026-11-08T16:47:00.000Z");
const earlier = "Hoi. Dit is een vaste welkomstzin.";

const turns: TranscriptTurn[] = [
  { id: "welcome", role: "assistant", text: earlier },
  { id: "vraag-1", role: "user", text: "Kun je Angular?" },
];

describe("chatTranscript", () => {
  it("bewaart het gesprek onder de eerste vraag van de bezoeker", () => {
    expect(chatTranscript(turns, "Ja. Angular staat bij de vaardigheden.", updatedAt)).toEqual({
      id: "vraag-1",
      updatedAt: "2026-11-08T16:47:00.000Z",
      turns: [
        { role: "assistant", text: earlier },
        { role: "user", text: "Kun je Angular?" },
        { role: "assistant", text: "Ja. Angular staat bij de vaardigheden." },
      ],
    });
  });

  it("laat een leeg antwoord weg", () => {
    expect(chatTranscript(turns, "", updatedAt).turns).toHaveLength(2);
  });
});
