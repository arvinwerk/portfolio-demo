import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, isStepCount, streamText, tool } from "ai";
import { z } from "zod";
import { ASSISTANT_CHARTER } from "../domain/charter";
import { asUiTurn, type TranscriptTurn } from "../domain/conversation";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import type { AssistantCredentials } from "../application/assistant-credentials";

export function createAnthropicSession(config: AssistantCredentials, knowledge: ProfileKnowledge) {
  const model = createAnthropic({ apiKey: config.apiKey })(config.model);

  return {
    async stream(turns: TranscriptTurn[]) {
      return streamText({
        model,
        system: ASSISTANT_CHARTER,
        messages: await convertToModelMessages(turns.map(asUiTurn)),
        stopWhen: isStepCount(4),
        tools: {
          searchProfile: tool({
            description:
              "Doorzoek het geïndexeerde profiel en haal de fragmenten op die bij de vraag horen. Gebruik woorden die in een cv kunnen staan, zoals werk, opleiding, woonplaats of achtergrond.",
            inputSchema: z.object({
              query: z.string().max(200).describe("Zoekwoorden uit de vraag."),
            }),
            execute: async ({ query }) => knowledge.search(query),
          }),
        },
      });
    },
  };
}
