import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { GuidanceInterpreter } from "../application/guide-visitor";
import type { AssistantCredentials } from "../application/assistant-credentials";
import { GUIDANCE_FOCUSES, SURFACES } from "../domain/guidance";

const guidanceSchema = z.object({
  surface: z.enum(SURFACES),
  focus: z.enum(GUIDANCE_FOCUSES).nullable(),
  explanation: z.string().min(1).max(600),
});

const CHARTER = `Je kiest een werkruimte op een portfoliopagina.
surface is portrait, work, thinking, experiments of challenge.
focus is keyword-selection, visitor-question, dependency-rule, scalable-assistant, of null.
explanation is één Nederlandse zin, zonder markdown en zonder code.
Kies thinking voor architectuur, work voor projecten, experiments voor AI of zoeken, challenge voor een ontwerp dat de bezoeker zelf maakt, portrait als niets past.
Verzin geen feiten over de persoon.`;

export function createGuidanceInterpreter(config: AssistantCredentials): GuidanceInterpreter {
  const model = createAnthropic({ apiKey: config.apiKey })(config.model);

  return {
    async interpret(text: string) {
      const { output } = await generateText({
        model,
        system: CHARTER,
        prompt: text,
        timeout: 12_000,
        output: Output.object({ schema: guidanceSchema }),
      });
      return output;
    },
  };
}
