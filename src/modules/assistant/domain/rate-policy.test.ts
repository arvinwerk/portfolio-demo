import { describe, expect, it } from "vitest";
import {
  CHAT_ADDRESS_LIMIT,
  CHAT_ADDRESS_WINDOW_MS,
  CHAT_GLOBAL_LIMIT,
  CHAT_GLOBAL_WINDOW_MS,
  MAX_TRACKED_ADDRESSES,
  decideRate,
  freshHits,
  retryAfterSeconds,
} from "./rate-policy";

const now = 1_000_000;

describe("freshHits", () => {
  it("laat een treffer op de rand van het venster vallen", () => {
    expect(freshHits([now - CHAT_ADDRESS_WINDOW_MS, now - 1], CHAT_ADDRESS_WINDOW_MS, now)).toEqual([now - 1]);
  });
});

describe("retryAfterSeconds", () => {
  it("wacht tot de oudste treffer uit het venster valt", () => {
    const hits = Array.from({ length: CHAT_ADDRESS_LIMIT }, (_, index) => now - 1_000 + index);
    expect(retryAfterSeconds(hits, CHAT_ADDRESS_LIMIT, CHAT_ADDRESS_WINDOW_MS, now)).toBe(59);
    expect(retryAfterSeconds(hits.slice(0, -1), CHAT_ADDRESS_LIMIT, CHAT_ADDRESS_WINDOW_MS, now)).toBe(0);
  });

  it("wacht minstens één seconde", () => {
    const hits = Array.from({ length: CHAT_ADDRESS_LIMIT }, () => now);
    expect(retryAfterSeconds(hits, CHAT_ADDRESS_LIMIT, CHAT_ADDRESS_WINDOW_MS, now)).toBe(60);
  });
});

describe("decideRate", () => {
  const open = {
    addressHits: [] as number[],
    globalHits: [] as number[],
    trackedAddresses: 0,
    addressKnown: false,
    now,
  };

  it("laat een leeg venster door", () => {
    expect(decideRate(open)).toEqual({ allowed: true });
  });

  it("weigert een adres op het plafond", () => {
    const addressHits = Array.from({ length: CHAT_ADDRESS_LIMIT }, (_, index) => now - 1_000 + index);
    expect(decideRate({ ...open, addressHits, addressKnown: true, trackedAddresses: 1 })).toEqual({
      allowed: false,
      retryAfterSeconds: 59,
    });
  });

  it("neemt de langste wacht als het procesplafond eerder vol is", () => {
    const globalHits = Array.from({ length: CHAT_GLOBAL_LIMIT }, () => now - 30_000);
    expect(decideRate({ ...open, globalHits, addressKnown: true, trackedAddresses: 1 })).toEqual({
      allowed: false,
      retryAfterSeconds: Math.ceil((CHAT_GLOBAL_WINDOW_MS - 30_000) / 1000),
    });
  });

  it("weigert een nieuw adres als de tabel vol is", () => {
    expect(decideRate({ ...open, trackedAddresses: MAX_TRACKED_ADDRESSES })).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
    expect(decideRate({ ...open, trackedAddresses: MAX_TRACKED_ADDRESSES, addressKnown: true })).toEqual({
      allowed: true,
    });
  });
});
