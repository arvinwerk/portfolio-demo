import "server-only";

import { AssistantNotConfigured } from "./application/assistant-credentials";
import { createAnthropicSession } from "./infrastructure/anthropic-assistant-session";
import { readAssistantConfig } from "./infrastructure/assistant-config";
import { createProfileKnowledge } from "./infrastructure/bm25-profile-knowledge";
import { createGuidanceInterpreter } from "./infrastructure/guidance-interpreter";
import { createHmacSeal, signAssistantTurn } from "./infrastructure/hmac-transcript-seal";
import { MemoryVisitorGate } from "./infrastructure/memory-visitor-gate";
import { respondToGuide } from "./interface/respond-to-guide";
import { respondToProbe } from "./interface/respond-to-probe";
import { respondToVisitor } from "./interface/respond-to-visitor";
import { CHAT_ADDRESS_LIMIT } from "./domain/rate-policy";
import type { GuidanceInterpreter } from "./application/guide-visitor";

const gate = new MemoryVisitorGate();
const guideGate = new MemoryVisitorGate();
const probeGate = new MemoryVisitorGate();
const knowledge = createProfileKnowledge();

export { CHAT_ADDRESS_LIMIT, signAssistantTurn };

export function handleVisitorChat(request: Request, voice: { welcome: string; honesty: string }): Promise<Response> {
  return respondToVisitor(request, {
    readConfig: () => readAssistantConfig(),
    sealFor: createHmacSeal,
    gate,
    knowledge: createProfileKnowledge(),
    welcome: voice.welcome,
    openSession: (config, knowledge) => createAnthropicSession(config, knowledge, voice.honesty),
  });
}

export function handleVisitorGuide(request: Request): Promise<Response> {
  return respondToGuide(request, {
    gate: guideGate,
    interpreter: () => openGuidance(),
  });
}

export function handleProfileProbe(request: Request): Promise<Response> {
  return respondToProbe(request, { gate: probeGate, knowledge });
}

function openGuidance(): GuidanceInterpreter | null {
  try {
    return createGuidanceInterpreter(readAssistantConfig());
  } catch (error) {
    if (error instanceof AssistantNotConfigured) {
      return null;
    }
    throw error;
  }
}
