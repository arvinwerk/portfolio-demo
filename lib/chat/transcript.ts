import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const DOMAIN = "portfolio-chat-v1\n";

export function signAssistantTurn(id: string, text: string, apiKey: string): string {
  return createHmac("sha256", apiKey).update(DOMAIN).update(id).update("\n").update(text).digest("base64url");
}

export function assistantTurnMatches(
  id: string,
  text: string,
  signature: string | undefined,
  apiKey: string,
): boolean {
  if (!signature || signature.length > 128) {
    return false;
  }

  const expected = signAssistantTurn(id, text, apiKey);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
