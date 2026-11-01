import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { transcriptSealPayload, type TranscriptSeal } from "../domain/transcript-seal";

export function signAssistantTurn(id: string, text: string, context: string, apiKey: string): string {
  return createHmac("sha256", apiKey).update(transcriptSealPayload(id, text, context)).digest("base64url");
}

export function createHmacSeal(apiKey: string): TranscriptSeal {
  return {
    sign: (id, text, context) => signAssistantTurn(id, text, context, apiKey),
    matches: (id, text, context, signature) => assistantTurnMatches(id, text, context, signature, apiKey),
  };
}

export function assistantTurnMatches(
  id: string,
  text: string,
  context: string,
  signature: string | undefined,
  apiKey: string,
): boolean {
  if (!signature || signature.length > 128) {
    return false;
  }

  const expected = signAssistantTurn(id, text, context, apiKey);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
