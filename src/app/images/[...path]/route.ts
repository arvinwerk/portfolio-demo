import { readSiteImage } from "@/modules/portfolio/server";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const image = readSiteImage(parts.join("/"));
  if (!image) {
    return new Response("Niet gevonden.", { status: 404 });
  }

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "content-type": image.contentType,
      "cache-control": "public, max-age=60",
    },
  });
}
