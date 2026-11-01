import { timingSafeEqual } from "node:crypto";
import { createServer, request as httpRequest, type IncomingMessage, type OutgoingHttpHeaders, type ServerResponse } from "node:http";
import { isSlug } from "./slug.js";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

export type ProxyState = {
  domain: string;
  basicAuth: { user: string; password: string } | undefined;
  routes: Record<string, { port: number }>;
};

export function slugFromHost(hostHeader: string, domain: string): string | undefined {
  const host = hostHeader.split(":")[0]?.trim().toLowerCase() ?? "";
  const suffix = `.${domain.trim().toLowerCase().replace(/\.$/, "")}`;
  if (suffix === "." || !host.endsWith(suffix)) {
    return undefined;
  }
  const label = host.slice(0, -suffix.length);
  if (!isSlug(label)) {
    return undefined;
  }
  return label;
}

export function credentialsMatch(header: string | undefined, user: string, password: string): boolean {
  if (!header?.startsWith("Basic ")) {
    return false;
  }
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice("Basic ".length).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const split = decoded.indexOf(":");
  if (split < 0) {
    return false;
  }
  return safeEqual(decoded.slice(0, split), user) && safeEqual(decoded.slice(split + 1), password);
}

export function createPreviewProxy(load: () => ProxyState) {
  const server = createServer((req, res) => {
    let state: ProxyState;
    try {
      state = load();
    } catch {
      writeText(res, 503, "Preview-configuratie is niet leesbaar.\n");
      return;
    }

    if (state.basicAuth && !credentialsMatch(req.headers.authorization, state.basicAuth.user, state.basicAuth.password)) {
      res.writeHead(401, {
        "www-authenticate": 'Basic realm="preview"',
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end("Deze preview is afgeschermd.\n");
      return;
    }

    const slug = slugFromHost(req.headers.host ?? "", state.domain);
    const target = slug ? state.routes[slug] : undefined;
    if (!target) {
      writeText(res, 404, "Geen preview voor deze host.\n");
      return;
    }

    // Keep the public Host so the app builds links for the preview hostname.
    // requestTimeout 0 lets /api/chat stream until the model is done.
    const headers = forwardHeaders(req);
    const proxyReq = httpRequest(
      {
        host: "127.0.0.1",
        port: target.port,
        method: req.method,
        path: req.url,
        headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, responseHeaders(proxyRes));
        proxyRes.pipe(res);
      },
    );
    proxyReq.setTimeout(0);
    proxyReq.on("error", () => {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      writeText(res, 502, "Preview is niet bereikbaar.\n");
    });
    req.pipe(proxyReq);
  });
  server.requestTimeout = 0;
  server.timeout = 0;
  return server;
}

function forwardHeaders(req: IncomingMessage): OutgoingHttpHeaders {
  const headers: OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || HOP_BY_HOP.has(key)) {
      continue;
    }
    headers[key] = value;
  }
  return headers;
}

function responseHeaders(proxyRes: IncomingMessage): OutgoingHttpHeaders {
  const headers: OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(proxyRes.headers)) {
    if (value === undefined || HOP_BY_HOP.has(key)) {
      continue;
    }
    headers[key] = value;
  }
  return headers;
}

function writeText(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
  res.end(body);
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}
