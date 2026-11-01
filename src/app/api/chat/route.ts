import { handleVisitorChat } from "@/modules/assistant/server";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const maxDuration = 30;

export function POST(request: Request) {
  const { profile } = loadPortfolioPage(undefined);
  return handleVisitorChat(request, {
    welcome: profile.statements.chatWelcome,
    honesty: profile.statements.chatHonesty,
  });
}
