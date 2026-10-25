export const CHAT_ADDRESS_LIMIT = 8;
export const CHAT_ADDRESS_WINDOW_MS = 60_000;
export const CHAT_GLOBAL_LIMIT = 100;
export const CHAT_GLOBAL_WINDOW_MS = 10 * 60_000;
export const MAX_TRACKED_ADDRESSES = 2_000;

export type RateDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function freshHits(hits: number[], windowMs: number, now: number): number[] {
  return hits.filter((hit) => now - hit < windowMs);
}

export function retryAfterSeconds(hits: number[], limit: number, windowMs: number, now: number): number {
  if (hits.length < limit) {
    return 0;
  }
  const oldest = hits[0] ?? now;
  return Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
}

export function decideRate(input: {
  addressHits: number[];
  globalHits: number[];
  trackedAddresses: number;
  addressKnown: boolean;
  now: number;
}): RateDecision {
  const addressRetry = retryAfterSeconds(input.addressHits, CHAT_ADDRESS_LIMIT, CHAT_ADDRESS_WINDOW_MS, input.now);
  const globalRetry = retryAfterSeconds(input.globalHits, CHAT_GLOBAL_LIMIT, CHAT_GLOBAL_WINDOW_MS, input.now);
  if (addressRetry > 0 || globalRetry > 0) {
    return { allowed: false, retryAfterSeconds: Math.max(addressRetry, globalRetry) };
  }

  if (!input.addressKnown && input.trackedAddresses >= MAX_TRACKED_ADDRESSES) {
    return { allowed: false, retryAfterSeconds: 60 };
  }

  return { allowed: true };
}
