import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import type { AssistantCredentials } from "../application/assistant-credentials";
import { ASSISTANT_CHARTER } from "../domain/charter";
import type { TranscriptTurn } from "../domain/conversation";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import { recruiterBriefing } from "../domain/recruiter-briefing";

const MODEL_TIMEOUT_MS = 25_000;

export function createLocalQwenSession(config: AssistantCredentials, knowledge: ProfileKnowledge, now: Date) {
  // De sleutel ondertekent het transcript. Het model krijgt hem niet.
  const model = createOpenAICompatible({
    name: "qwen",
    baseURL: config.baseUrl,
  }).chatModel(config.model);

  return {
    async stream(turns: TranscriptTurn[]) {
      const briefing = recruiterBriefing(await knowledge.facts(), now);
      const result = streamText({
        model,
        system: `${ASSISTANT_CHARTER}\n\n${briefing}`,
        messages: turns.map((turn) => ({ role: turn.role, content: turn.text })),
        temperature: 0.2,
        maxOutputTokens: 400,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });
      return { stream: result.stream };
    },
  };
}
