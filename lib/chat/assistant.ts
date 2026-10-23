import "server-only";

import { isStepCount, streamText, tool, type ModelMessage } from "ai";
import { z } from "zod";
import type { ProfileRetriever } from "@/lib/retrieval/profile-retriever";

const instructions = `Je bent de assistent op deze portfolio.
Antwoord kort en in het Nederlands.
Roep searchProfile aan voordat je iets over de persoon beweert.
Gebruik alleen de fragmenten die de tool teruggeeft. Vindt de tool niets, zeg dan dat het niet in het profiel staat.
Verzin geen projecten, datums of contactgegevens.`;

export function streamAssistant(options: {
  model: Parameters<typeof streamText>[0]["model"];
  messages: ModelMessage[];
  retriever: ProfileRetriever;
}) {
  const retriever = options.retriever;

  return streamText({
    model: options.model,
    system: instructions,
    messages: options.messages,
    stopWhen: isStepCount(4),
    tools: {
      searchProfile: tool({
        description:
          "Doorzoek het geïndexeerde profiel en haal de fragmenten op die bij de vraag horen. Gebruik woorden die in een cv kunnen staan, zoals werk, opleiding, woonplaats of achtergrond.",
        inputSchema: z.object({
          query: z.string().describe("Zoekwoorden uit de vraag."),
        }),
        execute: async ({ query }) => retriever.search(query),
      }),
    },
  });
}
