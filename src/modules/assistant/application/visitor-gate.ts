import type { RateDecision } from "../domain/rate-policy";

export interface VisitorGate {
  consume(address: string, now?: number): RateDecision;
}
