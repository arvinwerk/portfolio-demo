import type { VisitorGate } from "./visitor-gate";
import {
  interpretRequest,
  parseModelGuidance,
  readRequest,
  type Guidance,
} from "../domain/guidance";

export interface GuidanceInterpreter {
  interpret(text: string): Promise<unknown>;
}

export type GuidePlan =
  | { kind: "ready"; guidance: Guidance }
  | { kind: "limited"; retryAfterSeconds: number };

export async function guideVisitor(input: {
  text: unknown;
  address: string;
  gate: VisitorGate;
  interpreter: GuidanceInterpreter | null;
  now?: number;
}): Promise<GuidePlan> {
  const text = readRequest(input.text);
  const reading = interpretRequest(text);
  if (reading.matched || !input.interpreter) {
    return {
      kind: "ready",
      guidance: {
        surface: reading.surface,
        focus: reading.focus,
        explanation: reading.explanation,
        origin: "catalog",
        lead: reading.lead,
      },
    };
  }

  const decision = input.gate.consume(input.address, input.now);
  if (!decision.allowed) {
    return { kind: "limited", retryAfterSeconds: decision.retryAfterSeconds };
  }

  try {
    const parsed = parseModelGuidance(await input.interpreter.interpret(text));
    return { kind: "ready", guidance: { ...parsed, origin: "model", lead: false } };
  } catch {
    return {
      kind: "ready",
      guidance: {
        surface: reading.surface,
        focus: reading.focus,
        explanation: reading.explanation,
        origin: "catalog",
        lead: false,
      },
    };
  }
}
