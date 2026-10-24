export const CHAT_ADDRESS_LIMIT = 8;
export const CHAT_ADDRESS_WINDOW_MS = 60_000;
export const CHAT_GLOBAL_LIMIT = 100;
export const CHAT_GLOBAL_WINDOW_MS = 10 * 60_000;
const MAX_TRACKED_ADDRESSES = 2_000;

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export class ChatRateLimiter {
  private readonly addresses = new Map<string, number[]>();
  private globalHits: number[] = [];

  consume(address: string, now = Date.now()): RateLimitDecision {
    const addressHits = fresh(this.addresses.get(address) ?? [], CHAT_ADDRESS_WINDOW_MS, now);
    this.globalHits = fresh(this.globalHits, CHAT_GLOBAL_WINDOW_MS, now);
    if (addressHits.length === 0) {
      this.addresses.delete(address);
    } else {
      this.addresses.set(address, addressHits);
    }

    const addressRetry = retryAfter(addressHits, CHAT_ADDRESS_LIMIT, CHAT_ADDRESS_WINDOW_MS, now);
    const globalRetry = retryAfter(this.globalHits, CHAT_GLOBAL_LIMIT, CHAT_GLOBAL_WINDOW_MS, now);
    if (addressRetry > 0 || globalRetry > 0) {
      return { allowed: false, retryAfterSeconds: Math.max(addressRetry, globalRetry) };
    }

    if (!this.addresses.has(address) && this.addresses.size >= MAX_TRACKED_ADDRESSES) {
      return { allowed: false, retryAfterSeconds: 60 };
    }

    addressHits.push(now);
    this.globalHits.push(now);
    this.addresses.set(address, addressHits);
    return { allowed: true };
  }
}

export const chatRateLimiter = new ChatRateLimiter();

export function clientAddress(request: Request): string {
  const realIp = normalizeAddress(request.headers.get("x-real-ip") ?? "");
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const firstHop = forwarded.split(",")[0] ?? "";
  return normalizeAddress(firstHop) ?? "onbekend";
}

function normalizeAddress(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase().slice(0, 128);
  if (!/^[\da-f:.]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function fresh(hits: number[], windowMs: number, now: number): number[] {
  return hits.filter((hit) => now - hit < windowMs);
}

function retryAfter(hits: number[], limit: number, windowMs: number, now: number): number {
  if (hits.length < limit) {
    return 0;
  }
  const oldest = hits[0] ?? now;
  return Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
}
