import { describe, expect, it } from "vitest";
import {
  CHAT_ADDRESS_LIMIT,
  CHAT_ADDRESS_WINDOW_MS,
  CHAT_GLOBAL_LIMIT,
  CHAT_GLOBAL_WINDOW_MS,
  MAX_TRACKED_ADDRESSES,
} from "../domain/rate-policy";
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

  it("laat een nieuw adres toe zodra de oude vensters leeg zijn", () => {
    const limiter = new MemoryVisitorGate();
    let now = 1_000_000;
    let stored = 0;

    while (stored < MAX_TRACKED_ADDRESSES) {
      const room = Math.min(CHAT_GLOBAL_LIMIT, MAX_TRACKED_ADDRESSES - stored);
      for (let index = 0; index < room; index += 1) {
        expect(limiter.consume(`adres-${stored + index}`, now).allowed).toBe(true);
      }
      stored += room;
      now += CHAT_GLOBAL_WINDOW_MS;
    }

    expect(limiter.consume("nieuw", now)).toEqual({ allowed: true });
    expect(now - 1_000_000).toBeGreaterThan(CHAT_ADDRESS_WINDOW_MS);
  });
});
