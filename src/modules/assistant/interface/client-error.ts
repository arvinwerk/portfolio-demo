const FALLBACK = "Het antwoord lukte niet. Probeer het opnieuw.";

export async function readableChatError(response: Response): Promise<Response> {
  if (response.ok) {
    return response;
  }

  let message = FALLBACK;
  try {
    const parsed = JSON.parse(await response.text()) as { error?: unknown };
    if (typeof parsed.error === "string" && isVisitorSentence(parsed.error)) {
      message = parsed.error.trim();
    }
  } catch {
    message = FALLBACK;
  }

  return new Response(message, { status: response.status });
}

function isVisitorSentence(value: string): boolean {
  const text = value.trim();
  return text.length > 0 && text.length <= 200 && !text.includes("<") && !/[\r\n]/.test(text);
}
