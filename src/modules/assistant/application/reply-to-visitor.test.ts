import { describe, expect, it, vi } from "vitest";
import { ConversationRejected } from "../domain/conversation";
import type { TranscriptSeal } from "../domain/transcript-seal";
import { replyToVisitor } from "./reply-to-visitor";

const seal: TranscriptSeal = {
  sign: () => "",
  matches: () => false,
};

const question = [{ id: "1", role: "user", parts: [{ type: "text", text: "Hoi" }] }];

describe("replyToVisitor", () => {
  it("telt een ongeldig gesprek mee voordat het model opent", async () => {
    const consume = vi.fn(() => ({ allowed: true as const }));
    const stream = vi.fn();

    await expect(
      replyToVisitor({
        messages: [],
        address: "203.0.113.10",
        seal,
        gate: { consume },
        session: { stream },
        now: 1_000,
      }),
    ).rejects.toBeInstanceOf(ConversationRejected);

    expect(consume).toHaveBeenCalledWith("203.0.113.10", 1_000);
    expect(stream).not.toHaveBeenCalled();
  });

  it("opent het model niet als het tempo vol is", async () => {
    const stream = vi.fn();
    const plan = await replyToVisitor({
      messages: question,
      address: "203.0.113.10",
      seal,
      gate: { consume: () => ({ allowed: false, retryAfterSeconds: 12 }) },
      session: { stream },
      now: 5_000,
    });

    expect(plan).toEqual({ kind: "limited", retryAfterSeconds: 12 });
    expect(stream).not.toHaveBeenCalled();
  });
});
