// @vitest-environment node

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PreviewError } from "./errors.js";
import { publishPreview, removePreview, stopRouter } from "./preview-cli.js";
import { processAlive } from "./supervise.js";

const root = mkdtempSync(path.join(tmpdir(), "preview-root-"));
const work = mkdtempSync(path.join(tmpdir(), "preview-work-"));
const envFile = path.join(root, "preview.env");
const contentDir = path.join(root, "content");
const archivePath = path.join(work, "app.tar.xz");
const portMin = 25_000 + (process.pid % 1000) * 10;
let routerPort = 0;

const serverSource = `const http = require("node:http");
const port = Number(process.env.PORT);
const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({
    host: req.headers.host || "",
    key: process.env.AI_API_KEY || "",
    auth: process.env.PREVIEW_BASIC_AUTH || "",
    content: process.env.CONTENT_DIR || "",
    port,
    pid: process.pid
  }));
});
server.listen(port, "127.0.0.1");
`;

describe("publishPreview", () => {
  beforeAll(() => {
    const compiled = spawnSync("pnpm", ["exec", "tsc", "-p", "deploy/tsconfig.json"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    if (compiled.status !== 0) {
      throw new Error(`${compiled.stdout}\n${compiled.stderr}`);
    }
    routerPort = freePort();
    mkdirSync(contentDir);
    writeFileSync(
      envFile,
      [
        "PREVIEW_DOMAIN=preview.test",
        "PREVIEW_BASIC_AUTH=bezoeker:geheim",
        "AI_API_KEY=test-sleutel",
        `CONTENT_DIR=${contentDir}`,
        `PREVIEW_ROUTER_PORT=${routerPort}`,
        `PREVIEW_PORT_MIN=${portMin}`,
        `PREVIEW_PORT_MAX=${portMin + 5}`,
        "PREVIEW_MAX=1",
        "",
      ].join("\n"),
    );
    pack(serverSource, archivePath);
  }, 60_000);

  afterAll(async () => {
    await removePreview({ branch: "feature/filter", root });
    await removePreview({ branch: "feature/andere", root });
    await removePreview({ branch: "feature/stdin", root });
    await stopRouter(root);
    rmSync(root, { recursive: true, force: true });
    rmSync(work, { recursive: true, force: true });
  });

  it("zet een tak achter het subdomein, schermt de sleutel af en ruimt de oudste op", async () => {
    await expect(
      publishPreview({ branch: "master", archivePath, root, envFile }),
    ).rejects.toThrow(PreviewError);

    const emptyDir = path.join(work, "empty");
    mkdirSync(emptyDir);
    writeFileSync(path.join(emptyDir, "leesmij.txt"), "nee");
    const emptyArchive = path.join(work, "empty.tar.xz");
    spawnSync("tar", ["-C", emptyDir, "-cJf", emptyArchive, "."], { stdio: "inherit" });
    await expect(publishPreview({ branch: "feature/leeg", archivePath: emptyArchive, root, envFile })).rejects.toThrow(
      /standalone/,
    );

    const url = await publishPreview({ branch: "feature/filter", archivePath, root, envFile });
    expect(url).toBe("https://feature-filter.preview.test");

    const auth = `Basic ${Buffer.from("bezoeker:geheim").toString("base64")}`;
    const denied = await ask("feature-filter.preview.test");
    expect(denied.status).toBe(401);

    const accepted = await ask("feature-filter.preview.test", auth);
    expect(accepted.status).toBe(200);
    const body = JSON.parse(accepted.body) as {
      host: string;
      key: string;
      auth: string;
      content: string;
      port: number;
      pid: number;
    };
    expect(body.host).toBe("feature-filter.preview.test");
    expect(body.key).toBe("test-sleutel");
    expect(body.auth).toBe("");
    expect(body.content).toBe(contentDir);
    const firstPort = body.port;

    const again = await publishPreview({ branch: "feature/filter", archivePath, root, envFile });
    expect(again).toBe(url);
    const replaced = JSON.parse((await ask("feature-filter.preview.test", auth)).body) as { port: number; pid: number };
    expect(replaced.port).toBe(firstPort);
    expect(replaced.pid).not.toBe(body.pid);
    expect(processAlive(body.pid)).toBe(false);

    const other = await publishPreview({ branch: "feature/andere", archivePath, root, envFile });
    expect(other).toBe("https://feature-andere.preview.test");
    expect((await ask("feature-filter.preview.test", auth)).status).toBe(404);
    expect(processAlive(replaced.pid)).toBe(false);
    expect((await ask("feature-andere.preview.test", auth)).status).toBe(200);

    await removePreview({ branch: "feature/andere", root });
    expect((await ask("feature-andere.preview.test", auth)).status).toBe(404);

    const cli = path.join(process.cwd(), "deploy", "dist", "preview-cli.js");
    const streamed = spawnSync(process.execPath, [cli, "up", "feature/stdin"], {
      input: readFileSync(archivePath),
      encoding: "utf8",
      env: { ...process.env, PREVIEW_ROOT: root, PREVIEW_ENV_FILE: envFile },
    });
    expect(streamed.status, streamed.stderr).toBe(0);
    expect(streamed.stdout).toContain("preview-url=https://feature-stdin.preview.test");
    expect((await ask("feature-stdin.preview.test", auth)).status).toBe(200);

    await removePreview({ branch: "feature/stdin", root });
    expect((await ask("feature-stdin.preview.test", auth)).status).toBe(404);
    await removePreview({ branch: "onbekend", root });
  }, 40_000);
});

function pack(source: string, destination: string): void {
  const directory = path.join(work, `pack-${path.basename(destination)}`);
  mkdirSync(directory);
  writeFileSync(path.join(directory, "server.js"), source);
  const packed = spawnSync("tar", ["-C", directory, "-cJf", destination, "."], { encoding: "utf8" });
  if (packed.status !== 0) {
    throw new Error(packed.stderr);
  }
}

function freePort(): number {
  const probe = spawnSync("node", ["-e", "const n=require('node:net'); const s=n.createServer(); s.listen(0,'127.0.0.1',()=>{ process.stdout.write(String(s.address().port)); s.close(); });"], {
    encoding: "utf8",
  });
  if (probe.status !== 0) {
    throw new Error(probe.stderr);
  }
  return Number(probe.stdout);
}

function ask(host: string, authorization?: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = { host };
    if (authorization) {
      headers.authorization = authorization;
    }
    const req = httpRequest({ host: "127.0.0.1", port: routerPort, path: "/", headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") });
      });
    });
    req.on("error", reject);
    req.end();
  });
}
