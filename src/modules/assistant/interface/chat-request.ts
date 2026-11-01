export function refuseChatRequest(request: Request): Response | undefined {
  const site = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (site === "cross-site") {
    return chatProblem(403);
  }

  const media = (request.headers.get("content-type") ?? "").split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (media !== "application/json") {
    return chatProblem(415);
  }

  return undefined;
}

export function chatProblem(status: number, error = "Ongeldig verzoek.", headers?: Record<string, string>): Response {
  return Response.json(
    { error },
    {
      status,
      headers: {
        "cache-control": "no-store",
        ...headers,
      },
    },
  );
}
