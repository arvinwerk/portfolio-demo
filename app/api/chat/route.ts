import { convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from "ai";
import { streamAssistant } from "@/lib/chat/assistant";
import { createChatModel } from "@/lib/chat/model";
import { AiConfigError, ChatRequestError, parseChatMessages, readAiConfig } from "@/lib/ai";
import { createProfileRetriever } from "@/lib/retrieval/file-profile-store";

export const maxDuration = 30;

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

  const result = streamAssistant({
    model: createChatModel(config),
    messages: await convertToModelMessages(messages),
    retriever: createProfileRetriever(),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
