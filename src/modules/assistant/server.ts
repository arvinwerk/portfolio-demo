import "server-only";

import { createRecruiterSession } from "./infrastructure/recruiter-session";
import { readAssistantConfig } from "./infrastructure/assistant-config";
import { createProfileKnowledge } from "./infrastructure/bm25-profile-knowledge";
import { FileChatLog } from "./infrastructure/file-chat-log";
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
    openSession: (_config, knowledge) => createRecruiterSession(knowledge, new Date()),
    log: new FileChatLog(),
    now: () => new Date(),
  });
}
