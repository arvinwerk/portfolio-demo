const DEMO_KEY = "portfolio-seal-demo-public";
const DEMO_DOMAIN = "portfolio-seal-demo-v1\n";

export const SEAL_SAMPLE_ID = "demo-turn";
export const SEAL_SAMPLE_TEXT = "Dit fragment is alleen voor het experiment verzegeld.";

export async function demonstrateSeal(text: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(DEMO_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${DEMO_DOMAIN}${SEAL_SAMPLE_ID}\n${text}`));
  return base64Url(signed);
}

export async function demonstrationMatches(text: string, signature: string): Promise<boolean> {
  const expected = await demonstrateSeal(text);
  if (expected.length !== signature.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  return mismatch === 0;
}

function base64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
