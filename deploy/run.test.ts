// @vitest-environment node

import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
    const archive = path.join(lib, "tools.tar.xz");
    const packed = spawnSync("tar", ["-C", source, "-cJf", archive, "development", "run"]);
    expect(packed.status).toBe(0);

    const result = run("bootstrap", { ...process.env, HOME: lib, PORTFOLIO_LIB: path.join(lib, "host") }, readFileSync(archive));
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(path.join(lib, "host", "development"), "utf8")).toContain("exit 0");
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
