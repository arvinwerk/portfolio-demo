import { handleVisitorChat } from "@/modules/assistant/server";

export const maxDuration = 30;

export function POST(request: Request) {
  return handleVisitorChat(request);
}
