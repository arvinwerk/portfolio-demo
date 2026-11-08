import "server-only";

import type { TextStreamPart } from "ai";
import type { TranscriptTurn } from "../domain/conversation";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import { answerRecruiter } from "../domain/recruiter-answer";

const USAGE = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  inputTokenDetails: {
    noCacheTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  outputTokenDetails: {
    textTokens: 0,
    reasoningTokens: 0,
  },
};

export function createRecruiterSession(knowledge: ProfileKnowledge, now: Date) {
  return {
    async stream(turns: TranscriptTurn[]) {
      const question = [...turns].reverse().find((turn) => turn.role === "user")?.text ?? "";
      const answer = answerRecruiter(await knowledge.facts(), question, now);
      return { stream: spokenStream(answer) };
    },
  };
}

function spokenStream(text: string): ReadableStream<TextStreamPart<never>> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue({ type: "start" });
      controller.enqueue({ type: "text-start", id: "answer" });
      controller.enqueue({ type: "text-delta", id: "answer", text });
      controller.enqueue({ type: "text-end", id: "answer" });
      controller.enqueue({
        type: "finish",
        finishReason: "stop",
        rawFinishReason: "stop",
        totalUsage: USAGE,
      });
      controller.close();
    },
  });
}
