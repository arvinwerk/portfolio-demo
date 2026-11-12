// @vitest-environment node

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const script = path.join(process.cwd(), "deploy", "content");

describe("deploy/content", () => {
  it("zet de bestanden buiten de release en laat een gesprek staan", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-content-"));
    const dest = path.join(root, "share");
    const envFile = path.join(root, "portfolio.env");
    const dropIn = path.join(root, "content.conf");
    const bin = path.join(root, "bin");
    const calls = path.join(root, "systemctl.log");
    mkdirSync(path.join(dest, "chat"), { recursive: true });
    mkdirSync(bin);
    writeFileSync(path.join(dest, "chat", "gesprek.txt"), "bewaard");
    writeFileSync(envFile, "AI_API_KEY=geheim\nCONTENT_DIR=/oud\n");
    writeExecutable(path.join(bin, "systemctl"), `#!/bin/sh\nprintf '%s\\n' "\$*" >> ${shellQuote(calls)}\n`);

    const result = run(archive(root), {
      PATH: `${bin}:${process.env.PATH ?? ""}`,
      PORTFOLIO_CONTENT_DIR: dest,
      PORTFOLIO_ENV_FILE: envFile,
      PORTFOLIO_CONTENT_DROPIN: dropIn,
      PORTFOLIO_CONTENT_RESTART: "1",
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(`content-dir=${dest}`);
    expect(result.stdout).toContain("restart=ok");
    expect(readFileSync(path.join(dest, "personal.json"), "utf8")).toContain("Arvin");
    expect(readFileSync(path.join(dest, "rag", "recruiter.txt"), "utf8")).toContain("naam:");
    expect(existsSync(path.join(dest, "images", "profile.svg"))).toBe(true);
    expect(readFileSync(path.join(dest, "chat", "gesprek.txt"), "utf8")).toBe("bewaard");
    expect(readFileSync(envFile, "utf8")).toBe(`AI_API_KEY=geheim\nCONTENT_DIR=${dest}\n`);
    expect(readFileSync(dropIn, "utf8")).toContain(`Environment=CONTENT_DIR=${dest}`);
    expect(readFileSync(calls, "utf8")).toContain("--user daemon-reload");
    expect(readFileSync(calls, "utf8")).toContain("--user try-restart portfolio.service");
  });

  it("weigert een pad dat uit de uitpakmap ontsnapt", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-content-slip-"));
    const pack = path.join(root, "pack");
    mkdirSync(pack);
    writeFileSync(path.join(pack, "personal.json"), "{}\n");
    const archivePath = path.join(root, "slip.tar.xz");
    expect(spawnSync("tar", ["-C", pack, "-cJf", archivePath, "--transform=s,personal.json,../personal.json,", "personal.json"]).status).toBe(0);

    const result = run(readFileSync(archivePath), {
      PORTFOLIO_CONTENT_DIR: path.join(root, "share"),
      PORTFOLIO_ENV_FILE: path.join(root, "portfolio.env"),
      PORTFOLIO_CONTENT_DROPIN: path.join(root, "content.conf"),
      PORTFOLIO_CONTENT_RESTART: "0",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("buiten de uitpakmap");
    expect(existsSync(path.join(root, "personal.json"))).toBe(false);
  });

  it("weigert een archief zonder recruiterblad", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-content-short-"));
    const result = run(archive(root, false), {
      PORTFOLIO_CONTENT_DIR: path.join(root, "share"),
      PORTFOLIO_ENV_FILE: path.join(root, "portfolio.env"),
      PORTFOLIO_CONTENT_DROPIN: path.join(root, "content.conf"),
      PORTFOLIO_CONTENT_RESTART: "0",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("mist rag/recruiter.txt");
  });
});

function archive(root: string, withSheet = true): Buffer {
  const pack = path.join(root, "pack");
  mkdirSync(path.join(pack, "rag"), { recursive: true });
  mkdirSync(path.join(pack, "images"), { recursive: true });
  writeFileSync(path.join(pack, "personal.json"), '{"fullName":"Arvin"}\n');
  writeFileSync(path.join(pack, "projects.json"), "[]\n");
  writeFileSync(path.join(pack, "skills.json"), "[]\n");
  writeFileSync(path.join(pack, "banners.json"), "[]\n");
  if (withSheet) {
    writeFileSync(path.join(pack, "rag", "recruiter.txt"), "naam: Arvin\n");
  }
  writeFileSync(path.join(pack, "images", "profile.svg"), "<svg></svg>\n");
  const archivePath = path.join(root, "content.tar.xz");
  const packed = spawnSync("tar", ["-C", pack, "-cJf", archivePath, "."]);
  expect(packed.status, packed.stderr.toString()).toBe(0);
  return readFileSync(archivePath);
}

function run(input: Buffer, env: NodeJS.ProcessEnv): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(script, {
    input,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function writeExecutable(file: string, source: string): void {
  writeFileSync(file, source);
  chmodSync(file, 0o755);
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
