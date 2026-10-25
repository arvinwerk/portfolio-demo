export function clientAddress(request: Request): string {
  const realIp = normalizeAddress(request.headers.get("x-real-ip") ?? "");
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const firstHop = forwarded.split(",")[0] ?? "";
  return normalizeAddress(firstHop) ?? "onbekend";
}

function normalizeAddress(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase().slice(0, 128);
  if (!/^[\da-f:.]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}
