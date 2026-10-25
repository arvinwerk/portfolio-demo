import "server-only";

import { createAnthropicSession } from "./infrastructure/anthropic-assistant-session";
import { readAssistantConfig } from "./infrastructure/assistant-config";
import { createProfileKnowledge } from "./infrastructure/bm25-profile-knowledge";
import { createHmacSeal, signAssistantTurn } from "./infrastructure/hmac-transcript-seal";
import { MemoryVisitorGate } from "./infrastructure/memory-visitor-gate";
import { respondToVisitor } from "./interface/respond-to-visitor";
import { CHAT_ADDRESS_LIMIT } from "./domain/rate-policy";

const gate = new MemoryVisitorGate();

export { CHAT_ADDRESS_LIMIT, signAssistantTurn };

export function handleVisitorChat(request: Request): Promise<Response> {
  return respondToVisitor(request, {
    readConfig: () => readAssistantConfig(),
    sealFor: createHmacSeal,
    gate,
    knowledge: createProfileKnowledge(),
    openSession: createAnthropicSession,
  });
}
