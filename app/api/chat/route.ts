import { convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from "ai";
import { streamAssistant } from "@/lib/chat/assistant";
import { createChatModel } from "@/lib/chat/model";
import { chatRateLimiter, clientAddress } from "@/lib/chat/rate-limit";
import { assistantTurnMatches, signAssistantTurn } from "@/lib/chat/transcript";
import { AiConfigError, ChatRequestError, parseChatMessages, readAiConfig } from "@/lib/ai";
import { createProfileRetriever } from "@/lib/retrieval/file-profile-store";

export const maxDuration = 30;

const MAX_BODY_BYTES = 96 * 1024;

export async function POST(request: Request) {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return Response.json({ error: "Het verzoek is te groot." }, { status: 413 });
  }

  let body: { messages?: unknown };
  try {
    body = JSON.parse(raw) as { messages?: unknown };
  } catch {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  let config;
  try {
    config = readAiConfig();
  } catch (error) {
    const message = error instanceof AiConfigError ? error.message : "De chat is niet geconfigureerd.";
    return Response.json({ error: message }, { status: 503 });
  }

  let messages;
  try {
    messages = parseChatMessages(body.messages, {
      verifyAssistant: (id, text, signature) => assistantTurnMatches(id, text, signature, config.apiKey),
    });
  } catch (error) {
    const message = error instanceof ChatRequestError ? error.message : "Ongeldig verzoek.";
    return Response.json({ error: message }, { status: 400 });
  }

  const decision = chatRateLimiter.consume(clientAddress(request));
  if (!decision.allowed) {
    return Response.json(
      { error: "Te veel berichten. Wacht even en probeer het opnieuw." },
      { status: 429, headers: { "retry-after": String(decision.retryAfterSeconds) } },
    );
  }

  try {
    const result = streamAssistant({
      model: createChatModel(config),
      messages: await convertToModelMessages(messages),
      retriever: createProfileRetriever(),
    });
    const responseId = crypto.randomUUID();
    let spoken = "";

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages,
        generateMessageId: () => responseId,
        sendReasoning: false,
        onError: () => "Het antwoord lukte niet. Probeer het opnieuw.",
        messageMetadata: ({ part }) => {
          if (part.type === "text-delta") {
            spoken += part.text;
            return undefined;
          }
          if (part.type === "finish" && spoken.length > 0) {
            return { signature: signAssistantTurn(responseId, spoken, config.apiKey) };
          }
          return undefined;
        },
      }),
    });
  } catch {
    return Response.json({ error: "Het antwoord lukte niet. Probeer het opnieuw." }, { status: 502 });
  }
}
