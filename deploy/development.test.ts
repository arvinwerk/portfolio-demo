// @vitest-environment node

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = path.join(process.cwd(), "deploy", "development");
const roots: string[] = [];

describe("deploy/development", () => {
  afterEach(() => {
    for (const root of roots.splice(0)) {
      const pidFile = path.join(root, "pid");
      try {
        const pid = Number(readFileSync(pidFile, "utf8").trim());
        if (pid > 0) {
          process.kill(pid, "SIGTERM");
        }
      } catch {
        // The rejected archive never started a process.
      }
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("start het archief op de development-poort en houdt de chat-sleutel uit het antwoord", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-development-"));
    roots.push(root);
    const envFile = path.join(root, "development.env");
    const packDir = path.join(root, "pack");
    mkdirSync(packDir);
    writeFileSync(path.join(packDir, "server.js"), serverSource);
    const archive = path.join(root, "app.tar.xz");
    expect(spawnSync("tar", ["-C", packDir, "-cJf", archive, "server.js"]).status).toBe(0);
    const contentDir = path.join(root, "site-content");
    mkdirSync(contentDir);
    writeFileSync(envFile, `DEVELOPMENT_DOMAIN=development.example.nl\nAI_MODEL=demo\nAI_API_KEY=geheim\nCONTENT_DIR=${contentDir}\n`);

    const port = freePort();
    const result = spawnSync(script, {
      input: readFileSync(archive),
      encoding: "utf8",
      env: {
        ...process.env,
        PORTFOLIO_DEVELOPMENT_ROOT: root,
        PORTFOLIO_DEVELOPMENT_ENV: envFile,
        PORTFOLIO_DEVELOPMENT_PORT: String(port),
      },
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("development-url=https://development.example.nl");

    const body = get(`127.0.0.1`, port);
    expect(body).toContain("model=demo");
    expect(body).not.toContain("geheim");
    expect(body).toContain(`content=${contentDir}`);
  });

  it("weigert een archief dat buiten de map wijst", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-development-bad-"));
    roots.push(root);
    const archive = path.join(root, "bad.tar.xz");
    const packed = spawnSync("python3", ["-c", pythonTar, archive], { encoding: "utf8" });
    expect(packed.status, packed.stderr).toBe(0);

    const result = spawnSync(script, {
      input: readFileSync(archive),
      encoding: "utf8",
      env: {
        ...process.env,
        PORTFOLIO_DEVELOPMENT_ROOT: root,
        PORTFOLIO_DEVELOPMENT_ENV: path.join(root, "missing.env"),
        PORTFOLIO_DEVELOPMENT_PORT: "3999",
      },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("buiten de uitpakmap");
  });
});

const serverSource = `const http = require("node:http");
const server = http.createServer((req, res) => {
  res.end("model=" + (process.env.AI_MODEL || "") + " content=" + (process.env.CONTENT_DIR || ""));
});
server.listen(Number(process.env.PORT), "127.0.0.1");
`;

const pythonTar = `
import io, sys, tarfile
data = b"console.log(1)\\n"
with tarfile.open(sys.argv[1], "w:xz") as archive:
    info = tarfile.TarInfo("../server.js")
    info.size = len(data)
    archive.addfile(info, io.BytesIO(data))
`;

function freePort(): number {
  const probe = spawnSync(
    "node",
    ["-e", "const n=require('node:net'); const s=n.createServer(); s.listen(0,'127.0.0.1',()=>{ process.stdout.write(String(s.address().port)); s.close(); });"],
    { encoding: "utf8" },
  );
  if (probe.status !== 0) {
    throw new Error(probe.stderr);
  }
  return Number(probe.stdout);
}

function get(host: string, port: number): string {
  return spawnSync("node", ["-e", "fetch(process.argv[1]).then(async (res)=>process.stdout.write(await res.text()))", `http://${host}:${port}/`], {
    encoding: "utf8",
  }).stdout;
}
