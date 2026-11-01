import { createUIMessageStreamResponse, toUIMessageStream, type UIMessage } from "ai";
import { AssistantNotConfigured, type AssistantCredentials } from "../application/assistant-credentials";
import { replyToVisitor, type AssistantSession } from "../application/reply-to-visitor";
import type { VisitorGate } from "../application/visitor-gate";
import { asUiTurn, ConversationRejected } from "../domain/conversation";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import { transcriptContext, type TranscriptSeal } from "../domain/transcript-seal";
import { chatProblem, refuseChatRequest } from "./chat-request";
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
  const refused = refuseChatRequest(request);
  if (refused) {
    return refused;
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return chatProblem(400);
  }

  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return chatProblem(413, "Het verzoek is te groot.");
  }

  let body: { messages?: unknown };
  try {
    body = JSON.parse(raw) as { messages?: unknown };
  } catch {
    return chatProblem(400);
  }

  let config: AssistantCredentials;
  try {
    config = deps.readConfig();
  } catch (error) {
    const message = error instanceof AssistantNotConfigured ? error.message : "De chat is niet geconfigureerd.";
    return chatProblem(503, message);
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
      return chatProblem(429, "Te veel berichten. Wacht even en probeer het opnieuw.", {
        "retry-after": String(plan.retryAfterSeconds),
      });
    }

    const originalMessages: UIMessage[] = plan.turns.map(asUiTurn);
    let spoken = "";

    return createUIMessageStreamResponse({
      headers: { "cache-control": "no-store" },
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
            return { signature: seal.sign(plan.responseId, spoken, transcriptContext(plan.turns)) };
          }
          return undefined;
        },
      }),
    });
  } catch (error) {
    if (error instanceof ConversationRejected) {
      return chatProblem(400, error.message);
    }
    return chatProblem(502, "Het antwoord lukte niet. Probeer het opnieuw.");
  }
}
