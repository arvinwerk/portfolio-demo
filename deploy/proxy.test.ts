// @vitest-environment node

import { createServer, request as httpRequest, type IncomingMessage, type ServerResponse } from "node:http";
import { describe, expect, it } from "vitest";
import { createPreviewProxy, credentialsMatch, slugFromHost, type ProxyState } from "./proxy.js";

describe("preview-router", () => {
  it("leest de tak uit de hostnaam", () => {
    expect(slugFromHost("Feature-Filter.preview.example.nl:443", "preview.example.nl")).toBe("feature-filter");
    expect(slugFromHost("preview.example.nl", "preview.example.nl")).toBeUndefined();
    expect(slugFromHost("filter.example.nl", "preview.example.nl")).toBeUndefined();
    expect(slugFromHost("a.b.preview.example.nl", "preview.example.nl")).toBeUndefined();
  });

  it("vergelijkt de basic-auth zonder de lengte te laten lekken in de uitkomst", () => {
    const header = `Basic ${Buffer.from("bezoeker:geheim").toString("base64")}`;
    expect(credentialsMatch(header, "bezoeker", "geheim")).toBe(true);
    expect(credentialsMatch(header, "bezoeker", "ander")).toBe(false);
    expect(credentialsMatch(header, "bezoeker", "geheim-maar-langer")).toBe(false);
    expect(credentialsMatch(undefined, "bezoeker", "geheim")).toBe(false);
  });

  it("stuurt de stream door zonder op het einde te wachten en houdt de publieke host", async () => {
    const upstream = createServer((req, res) => {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "x-real-ip": req.headers["x-real-ip"] ?? "" });
      res.write(`host=${req.headers.host ?? ""}|`);
      setTimeout(() => {
        res.end("klaar");
      }, 400);
    });
    await listen(upstream);
    const upstreamPort = portOf(upstream);

    let state: ProxyState = {
      domain: "preview.test",
      basicAuth: { user: "bezoeker", password: "geheim" },
      routes: { filter: { port: upstreamPort } },
    };
    const proxy = createPreviewProxy(() => state);
    await listen(proxy);
    const proxyPort = portOf(proxy);

    const denied = await textRequest(proxyPort, {});
    expect(denied.status).toBe(401);

    const accepted = await textRequest(proxyPort, {
      authorization: `Basic ${Buffer.from("bezoeker:geheim").toString("base64")}`,
      host: "filter.preview.test",
      "x-real-ip": "203.0.113.8",
    });
    expect(accepted.status).toBe(200);
    expect(accepted.firstChunkAt).toBeLessThan(250);
    expect(accepted.body).toBe("host=filter.preview.test|klaar");
    expect(accepted.headers["x-real-ip"]).toBe("203.0.113.8");

    state = { ...state, routes: {} };
    const missing = await textRequest(proxyPort, {
      authorization: `Basic ${Buffer.from("bezoeker:geheim").toString("base64")}`,
      host: "filter.preview.test",
    });
    expect(missing.status).toBe(404);

    state = { domain: "preview.test", basicAuth: state.basicAuth, routes: { filter: { port: upstreamPort } } };
    await new Promise<void>((resolve, reject) => {
      upstream.close((error) => (error ? reject(error) : resolve()));
    });
    const down = await textRequest(proxyPort, {
      authorization: `Basic ${Buffer.from("bezoeker:geheim").toString("base64")}`,
      host: "filter.preview.test",
    });
    expect(down.status).toBe(502);
    proxy.close();
  });
});

function listen(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
}

function portOf(server: ReturnType<typeof createServer>): number {
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Geen poort.");
  }
  return address.port;
}

function textRequest(
  port: number,
  headers: IncomingMessage["headers"],
): Promise<{ status: number; body: string; firstChunkAt: number; headers: IncomingMessage["headers"] }> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const req = httpRequest({ host: "127.0.0.1", port, path: "/", headers }, (res: ServerResponse | IncomingMessage) => {
      const response = res as IncomingMessage;
      let body = "";
      let firstChunkAt = 0;
      response.on("data", (chunk: Buffer) => {
        if (firstChunkAt === 0) {
          firstChunkAt = Date.now() - started;
        }
        body += chunk.toString("utf8");
      });
      response.on("end", () => {
        resolve({ status: response.statusCode ?? 0, body, firstChunkAt, headers: response.headers });
      });
      response.on("error", reject);
    });
    req.on("error", reject);
    req.end();
  });
}
