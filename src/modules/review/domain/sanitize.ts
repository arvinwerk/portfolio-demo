const privateKey = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
const credentialUrl = /\b[a-z][a-z0-9+.-]*:\/\/[^\s/@]+:[^\s/@]+@[^\s]+/gi;
const bearer = /\bBearer\s+[A-Za-z0-9._~+/-]{8,}/gi;
const secretToken = /\b(?:sk-[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{16})\b/g;
const assignment =
  /(^|\n)[^\n]*\b(?:AI_API_KEY|API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY|CREDENTIAL)\b[^\n]*=[^\n]*/gi;
const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const ipAddress = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const absolutePath = /(?:\/home\/|\/Users\/|\/etc\/|\/var\/)[^\s`'"]+/g;

export function sanitizePublicText(value: string): string {
  return value
    .replace(privateKey, "")
    .replace(credentialUrl, "")
    .replace(bearer, "")
    .replace(secretToken, "")
    .replace(assignment, "")
    .replace(email, "[e-mail]")
    .replace(ipAddress, "[adres]")
    .replace(absolutePath, "[pad]")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
