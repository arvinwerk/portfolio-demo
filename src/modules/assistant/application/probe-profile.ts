import { readProbeQuery } from "../domain/probe";
import type { ProfileFragment, ProfileKnowledge } from "../domain/profile-knowledge";
import type { VisitorGate } from "./visitor-gate";

export type ProbePlan =
  | { kind: "limited"; retryAfterSeconds: number }
  | { kind: "ready"; found: boolean; fragments: ProfileFragment[]; note?: string };

export async function probeProfile(input: {
  query: unknown;
  address: string;
  gate: VisitorGate;
  knowledge: ProfileKnowledge;
  now?: number;
}): Promise<ProbePlan> {
  const query = readProbeQuery(input.query);
  const decision = input.gate.consume(input.address, input.now);
  if (!decision.allowed) {
    return { kind: "limited", retryAfterSeconds: decision.retryAfterSeconds };
  }

  const search = await input.knowledge.search(query);
  return {
    kind: "ready",
    found: search.found,
    fragments: search.fragments,
    ...(search.note ? { note: search.note } : {}),
  };
}
