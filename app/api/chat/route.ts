import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, createUIMessageStreamResponse, isStepCount, streamText, tool, toUIMessageStream } from "ai";
import { z } from "zod";
import { AiConfigError, ChatRequestError, parseChatMessages, readAiConfig } from "@/lib/ai";
import { searchProfile } from "@/lib/rag";

export const maxDuration = 30;

const instructions = `Je bent de assistent op deze portfolio.
Antwoord kort en in het Nederlands.
Roep searchProfile aan voordat je iets over de persoon beweert.
Gebruik alleen de fragmenten die de tool teruggeeft. Vindt de tool niets, zeg dan dat het niet in het profiel staat.
Verzin geen projecten, datums of contactgegevens.`;

export async function POST(request: Request) {
  let messages;
  try {
    const body = (await request.json()) as { messages?: unknown };
    messages = parseChatMessages(body.messages);
  } catch (error) {
    const message = error instanceof ChatRequestError ? error.message : "Ongeldig verzoek.";
    return Response.json({ error: message }, { status: 400 });
  }

  let config;
  try {
    config = readAiConfig();
  } catch (error) {
    const message = error instanceof AiConfigError ? error.message : "De chat is niet geconfigureerd.";
    return Response.json({ error: message }, { status: 503 });
  }

  const anthropic = createAnthropic({ apiKey: config.apiKey });
  const result = streamText({
    model: anthropic(config.model),
    system: instructions,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(4),
    tools: {
      searchProfile: tool({
        description:
          "Doorzoek het geïndexeerde profiel en haal de fragmenten op die bij de vraag horen. Gebruik woorden die in een cv kunnen staan, zoals werk, opleiding, woonplaats of achtergrond.",
        inputSchema: z.object({
          query: z.string().describe("Zoekwoorden uit de vraag."),
        }),
        execute: async ({ query }) => searchProfile(query),
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
