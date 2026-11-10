// @vitest-environment node

import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dispatcher = path.join(process.cwd(), "deploy", "run");

describe("deploy/run", () => {
  it("laat productie aan het oude commando en stuurt development apart", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-run-"));
    const productionLog = path.join(lib, "production.log");
    const developmentLog = path.join(lib, "development.log");
    writeExecutable(path.join(lib, "run-production"), `#!/bin/sh\ncat > ${shellQuote(productionLog)}\n`);
    writeExecutable(path.join(lib, "development"), `#!/bin/sh\ncat > ${shellQuote(developmentLog)}\n`);

    const env = {
      ...process.env,
      HOME: lib,
      PORTFOLIO_LIB: lib,
      PORTFOLIO_PRODUCTION_RUN: path.join(lib, "run-production"),
    };

    const probe = run("bootstrap-probe", env);
    expect(probe.status).toBe(0);
    expect(probe.stdout).toBe("probe-ok\n");

    const production = run("run", env, "het-archief");
    expect(production.status).toBe(0);
    expect(readFileSync(productionLog, "utf8")).toBe("het-archief");

    const development = run("development", env, "development-archief");
    expect(development.status).toBe(0);
    expect(readFileSync(developmentLog, "utf8")).toBe("development-archief");
    expect(readFileSync(productionLog, "utf8")).toBe("het-archief");

    const unknown = run("preview feature-filter", env);
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain("Onbekend commando");
  });

  it("pakt bootstrap uit in de lib-map", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-boot-"));
    const source = path.join(lib, "source");
    mkdirSync(source);
    writeExecutable(path.join(source, "development"), "#!/bin/sh\nexit 0\n");
    writeExecutable(path.join(source, "run"), "#!/bin/sh\nexit 0\n");
    writeExecutable(path.join(source, "ssl"), "#!/bin/sh\nexit 0\n");
    const archive = path.join(lib, "tools.tar.xz");
    const packed = spawnSync("tar", ["-C", source, "-cJf", archive, "development", "run", "ssl"]);
    expect(packed.status).toBe(0);

    const result = run("bootstrap", { ...process.env, HOME: lib, PORTFOLIO_LIB: path.join(lib, "host") }, readFileSync(archive));
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(path.join(lib, "host", "development"), "utf8")).toContain("exit 0");
    expect(statSync(path.join(lib, "host", "ssl")).mode & 0o111).not.toBe(0);
  });

  it("start TLS als root en leest het adres uit ssl.env", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-ssl-run-"));
    const bin = path.join(lib, "bin");
    mkdirSync(bin);
    const sudoLog = path.join(lib, "sudo.log");
    writeExecutable(path.join(lib, "ssl"), "#!/bin/sh\nprintf 'site-url=https://%s/\\n' \"$SITE_ADDRESS\"\n");
    writeExecutable(
      path.join(bin, "sudo"),
      `#!/bin/sh\nprintf '%s\\n' "\$@" > ${shellQuote(sudoLog)}\nshift 2\nexec "\$@"\n`,
    );
    writeFileSync(path.join(lib, "ssl.env"), "SITE_ADDRESS=portfolio.example.nl\nCERTBOT_EMAIL=beheer@example.nl\n");

    const result = run("ssl", {
      ...process.env,
      HOME: lib,
      PATH: `${bin}:${process.env.PATH ?? ""}`,
      PORTFOLIO_LIB: lib,
      PORTFOLIO_SSL_ENV: path.join(lib, "ssl.env"),
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("site-url=https://portfolio.example.nl/\n");
    expect(readFileSync(sudoLog, "utf8")).toContain("--preserve-env=SITE_ADDRESS,CERTBOT_EMAIL,PORTFOLIO_SSL_IP,PORTFOLIO_SSL_IPV6");
    expect(readFileSync(sudoLog, "utf8")).toContain(path.join(lib, "ssl"));
  });

  it("zegt welk sudo-recht ontbreekt als TLS niet als root start", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-ssl-sudo-"));
    const bin = path.join(lib, "bin");
    mkdirSync(bin);
    writeExecutable(path.join(lib, "ssl"), "#!/bin/sh\nexit 0\n");
    writeExecutable(path.join(bin, "sudo"), "#!/bin/sh\nexit 1\n");

    const result = run("ssl", {
      ...process.env,
      HOME: lib,
      PATH: `${bin}:${process.env.PATH ?? ""}`,
      PORTFOLIO_LIB: lib,
      USER: "arvinwerk",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("arvinwerk ALL=(root) NOPASSWD:");
    expect(result.stderr).toContain(path.join(lib, "ssl"));
  });

  it("geeft het content-archief aan deploy/content", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-content-run-"));
    const received = path.join(lib, "ontvangen");
    writeExecutable(path.join(lib, "content"), `#!/bin/sh\ncat > ${shellQuote(received)}\nprintf 'content-dir=/data\\nrestart=skipped\\n'\n`);

    const result = run("content", { ...process.env, HOME: lib, PORTFOLIO_LIB: lib }, "archief");

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(received, "utf8")).toBe("archief");
    expect(result.stdout).toContain("content-dir=/data");
  });

  it("weigert content als het script nog niet op de VM staat", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-content-missing-"));
    const result = run("content", { ...process.env, HOME: lib, PORTFOLIO_LIB: lib });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("deploy/content ontbreekt");
  });

  it("weigert TLS als het script nog niet op de VM staat", () => {
    const lib = mkdtempSync(path.join(tmpdir(), "portfolio-ssl-missing-"));
    const result = run("ssl", { ...process.env, HOME: lib, PORTFOLIO_LIB: lib });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("deploy/ssl ontbreekt");
  });
});

function run(command: string, env: NodeJS.ProcessEnv, input?: string | Buffer): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(dispatcher, {
    input,
    encoding: "utf8",
    env: { ...env, SSH_ORIGINAL_COMMAND: command },
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
