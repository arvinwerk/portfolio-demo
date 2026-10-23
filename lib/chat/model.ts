import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";

export function createChatModel(config: { model: string; apiKey: string }) {
  return createAnthropic({ apiKey: config.apiKey })(config.model);
}
