export function clientAddress(request: Request): string {
  const realIp = normalizeAddress(request.headers.get("x-real-ip") ?? "");
  if (realIp) {
    return realIp;
  }

  return forwardedAddress(request.headers.get("x-forwarded-for") ?? "") ?? "onbekend";
}

function forwardedAddress(header: string): string | undefined {
  const hops = header.split(",");
  for (let index = hops.length - 1; index >= 0; index -= 1) {
    const address = normalizeAddress(hops[index] ?? "");
    if (address) {
      return address;
    }
  }
  return undefined;
}

function normalizeAddress(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase().slice(0, 128);
  if (!/^[\da-f:.]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}
