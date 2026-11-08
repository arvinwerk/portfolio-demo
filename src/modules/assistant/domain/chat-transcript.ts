import { ConversationRejected, type TranscriptTurn } from "./conversation";

export type ChatTranscriptTurn = {
  role: "user" | "assistant";
  text: string;
};

export type ChatTranscript = {
  id: string;
  updatedAt: string;
  turns: readonly ChatTranscriptTurn[];
};

export function chatTranscript(turns: readonly TranscriptTurn[], answer: string, updatedAt: Date): ChatTranscript {
  const firstUser = turns.find((turn) => turn.role === "user");
  if (!firstUser) {
    throw new ConversationRejected("Stuur een vraag.");
  }

  const recorded = turns.map((turn) => ({ role: turn.role, text: turn.text }));
  if (answer.length > 0) {
    recorded.push({ role: "assistant", text: answer });
  }

  return { id: firstUser.id, updatedAt: updatedAt.toISOString(), turns: recorded };
}
