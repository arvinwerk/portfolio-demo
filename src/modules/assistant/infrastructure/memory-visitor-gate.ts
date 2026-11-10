import {
  CHAT_ADDRESS_WINDOW_MS,
  CHAT_GLOBAL_WINDOW_MS,
  decideRate,
  freshHits,
  type RateDecision,
} from "../domain/rate-policy";

export class MemoryVisitorGate {
  private readonly addresses = new Map<string, number[]>();
  private globalHits: number[] = [];

  consume(address: string, now: number): RateDecision {
    this.globalHits = freshHits(this.globalHits, CHAT_GLOBAL_WINDOW_MS, now);
    for (const [known, hits] of this.addresses) {
      const fresh = freshHits(hits, CHAT_ADDRESS_WINDOW_MS, now);
      if (fresh.length === 0) {
        this.addresses.delete(known);
      } else if (fresh.length !== hits.length) {
        this.addresses.set(known, fresh);
      }
    }

    const addressHits = this.addresses.get(address) ?? [];
    const decision = decideRate({
      addressHits,
      globalHits: this.globalHits,
      trackedAddresses: this.addresses.size,
      addressKnown: this.addresses.has(address),
      now,
    });
    if (!decision.allowed) {
      return decision;
    }

    this.addresses.set(address, [...addressHits, now]);
    this.globalHits.push(now);
    return { allowed: true };
  }
}
