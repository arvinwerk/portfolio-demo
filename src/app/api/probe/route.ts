import { handleProfileProbe } from "@/modules/assistant/server";

export function POST(request: Request) {
  return handleProfileProbe(request);
}
