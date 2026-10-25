import { createUIMessageStreamResponse, toUIMessageStream, type UIMessage } from "ai";
import { AssistantNotConfigured, type AssistantCredentials } from "../application/assistant-credentials";
import { replyToVisitor, type AssistantSession } from "../application/reply-to-visitor";
import type { VisitorGate } from "../application/visitor-gate";
import { asUiTurn, ConversationRejected } from "../domain/conversation";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import type { TranscriptSeal } from "../domain/transcript-seal";
import { clientAddress } from "./client-address";

const MAX_BODY_BYTES = 96 * 1024;

type ModelStream = Parameters<typeof toUIMessageStream>[0]["stream"];

export type VisitorChatDeps = {
  readConfig(): AssistantCredentials;
  sealFor(apiKey: string): TranscriptSeal;
  gate: VisitorGate;
  knowledge: ProfileKnowledge;
  openSession(config: AssistantCredentials, knowledge: ProfileKnowledge): AssistantSession<{ stream: ModelStream }>;
};

export async function respondToVisitor(request: Request, deps: VisitorChatDeps): Promise<Response> {
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

  let config: AssistantCredentials;
  try {
    config = deps.readConfig();
  } catch (error) {
    const message = error instanceof AssistantNotConfigured ? error.message : "De chat is niet geconfigureerd.";
    return Response.json({ error: message }, { status: 503 });
  }

  const seal = deps.sealFor(config.apiKey);

  try {
    const plan = await replyToVisitor({
      messages: body.messages,
      address: clientAddress(request),
      seal,
      gate: deps.gate,
      session: deps.openSession(config, deps.knowledge),
    });

    if (plan.kind === "limited") {
      return Response.json(
        { error: "Te veel berichten. Wacht even en probeer het opnieuw." },
        { status: 429, headers: { "retry-after": String(plan.retryAfterSeconds) } },
      );
    }

    const originalMessages: UIMessage[] = plan.turns.map(asUiTurn);
    let spoken = "";

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: plan.stream.stream,
        originalMessages,
        generateMessageId: () => plan.responseId,
        sendReasoning: false,
        onError: () => "Het antwoord lukte niet. Probeer het opnieuw.",
        messageMetadata: ({ part }) => {
          if (part.type === "text-delta") {
            spoken += part.text;
            return undefined;
          }
          if (part.type === "finish" && spoken.length > 0) {
            return { signature: seal.sign(plan.responseId, spoken) };
          }
          return undefined;
        },
      }),
    });
  } catch (error) {
    if (error instanceof ConversationRejected) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "Het antwoord lukte niet. Probeer het opnieuw." }, { status: 502 });
  }
}
