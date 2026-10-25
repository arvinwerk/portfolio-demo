import { describe, expect, it } from "vitest";
import { CHAT_ADDRESS_LIMIT, CHAT_GLOBAL_LIMIT } from "../domain/rate-policy";
import { MemoryVisitorGate } from "./memory-visitor-gate";

describe("MemoryVisitorGate", () => {
  it("laat een adres tot de grens door en wacht daarna het venster af", () => {
    const limiter = new MemoryVisitorGate();
    const start = 1_000_000;

    for (let attempt = 0; attempt < CHAT_ADDRESS_LIMIT; attempt += 1) {
      expect(limiter.consume("203.0.113.10", start + attempt)).toEqual({ allowed: true });
    }

    expect(limiter.consume("203.0.113.10", start + CHAT_ADDRESS_LIMIT)).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
    expect(limiter.consume("203.0.113.11", start + CHAT_ADDRESS_LIMIT)).toEqual({ allowed: true });
    expect(limiter.consume("203.0.113.10", start + 60_000)).toEqual({ allowed: true });
  });

  it("deelt een plafond over alle adressen", () => {
    const limiter = new MemoryVisitorGate();
    const start = 1_000_000;

    for (let attempt = 0; attempt < CHAT_GLOBAL_LIMIT; attempt += 1) {
      expect(limiter.consume(`198.51.100.${attempt % 200}`, start)).toEqual({ allowed: true });
    }

    expect(limiter.consume("198.51.100.250", start).allowed).toBe(false);
  });
});
