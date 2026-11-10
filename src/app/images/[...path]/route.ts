import { readSiteImage } from "@/modules/portfolio/server";

const IMAGE_POLICY = {
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; object-src 'none'",
  "cache-control": "public, max-age=60",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const image = readSiteImage(parts.join("/"));
  if (!image) {
    return new Response("Niet gevonden.", { status: 404, headers: { "x-content-type-options": "nosniff" } });
  }

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      ...IMAGE_POLICY,
      "content-type": image.contentType,
    },
  });
}
