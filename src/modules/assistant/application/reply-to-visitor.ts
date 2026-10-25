import { restoreConversation, type TranscriptTurn } from "../domain/conversation";
import type { TranscriptSeal } from "../domain/transcript-seal";
import type { VisitorGate } from "./visitor-gate";

export type ReplyPlan<T> =
  | { kind: "limited"; retryAfterSeconds: number }
  | { kind: "ready"; turns: TranscriptTurn[]; stream: T; responseId: string };

export interface AssistantSession<T> {
  stream(turns: TranscriptTurn[]): Promise<T>;
}

export async function replyToVisitor<T>(input: {
  messages: unknown;
  address: string;
  seal: TranscriptSeal;
  gate: VisitorGate;
  session: AssistantSession<T>;
  now?: number;
}): Promise<ReplyPlan<T>> {
  const turns = restoreConversation(input.messages, {
    verifyAssistant: (id, text, signature) => input.seal.matches(id, text, signature),
  });
  const decision = input.gate.consume(input.address, input.now);
  if (!decision.allowed) {
    return { kind: "limited", retryAfterSeconds: decision.retryAfterSeconds };
  }

  return {
    kind: "ready",
    turns,
    stream: await input.session.stream(turns),
    responseId: crypto.randomUUID(),
  };
}
