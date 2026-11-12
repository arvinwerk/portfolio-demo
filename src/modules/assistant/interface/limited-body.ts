export const MAX_CHAT_BODY_BYTES = 96 * 1024;

const INVALID = "Ongeldig verzoek.";
const TOO_LARGE = "Het verzoek is te groot.";

export type LimitedBody = { ok: true; text: string } | { ok: false; status: 400 | 413; error: string };

export async function readLimitedBody(request: Request, maxBytes = MAX_CHAT_BODY_BYTES): Promise<LimitedBody> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    if (!/^\d+$/.test(declared)) {
      return { ok: false, status: 400, error: INVALID };
    }
    const length = Number(declared);
    if (!Number.isSafeInteger(length) || length > maxBytes) {
      return { ok: false, status: 413, error: TOO_LARGE };
    }
  }

  if (!request.body) {
    return { ok: true, text: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) {
        break;
      }
      total += next.value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, error: TOO_LARGE };
      }
      chunks.push(next.value);
    }
  } catch {
    return { ok: false, status: 400, error: INVALID };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}
