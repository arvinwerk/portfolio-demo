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

  consume(address: string, now = Date.now()): RateDecision {
    const addressHits = freshHits(this.addresses.get(address) ?? [], CHAT_ADDRESS_WINDOW_MS, now);
    this.globalHits = freshHits(this.globalHits, CHAT_GLOBAL_WINDOW_MS, now);
    if (addressHits.length === 0) {
      this.addresses.delete(address);
    } else {
      this.addresses.set(address, addressHits);
    }

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

    addressHits.push(now);
    this.globalHits.push(now);
    this.addresses.set(address, addressHits);
    return { allowed: true };
  }
}
