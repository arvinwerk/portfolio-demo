export async function readableChatError(response: Response): Promise<Response> {
  if (response.ok) {
    return response;
  }

  const raw = await response.text();
  let message = raw;

  try {
    const parsed = JSON.parse(raw) as { error?: unknown };
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      message = parsed.error;
    }
  } catch {
    message = raw;
  }

  return new Response(message, { status: response.status });
}
