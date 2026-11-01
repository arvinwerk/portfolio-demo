import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { unsafeTarEntry } from "./archive.js";
import { PreviewError } from "./errors.js";
import { appProcessEnv, loadPreviewConfig, type PreviewConfig } from "./env-file.js";
import { createPreviewProxy, type ProxyState } from "./proxy.js";
import { allocateRoute, removeRoute, type EvictedRoute } from "./routes.js";
import { previewSlug } from "./slug.js";
import { readTable, withLock, writeTable } from "./store.js";
import { canConnect, processAlive, readPid, startProcess, stopListening, waitForPort, writePid } from "./supervise.js";

const START_TIMEOUT_MS = 30_000;
const ARCHIVE_LIMIT_BYTES = 200 * 1024 * 1024;

export function previewRoot(): string {
  return process.env.PREVIEW_ROOT ?? path.join(homedir(), ".local", "share", "portfolio-previews");
}

export function previewEnvFile(): string {
  return process.env.PREVIEW_ENV_FILE ?? path.join(homedir(), ".config", "portfolio", "preview.env");
}

export async function publishPreview(options: {
  branch: string;
  archivePath: string;
  root: string;
  envFile: string;
}): Promise<string> {
  const slug = requireSlug(options.branch);
  const config = loadPreviewConfig(options.envFile);
  await assertArchive(options.archivePath);

  return withLock(options.root, async () => {
    const table = readTable(options.root);
    const allocated = allocateRoute(table, slug, {
      max: config.maxPreviews,
      portMin: config.portMin,
      portMax: config.portMax,
      now: Date.now(),
    });
    writeTable(options.root, allocated.table);

    let startedPid = 0;
    const port = allocated.port;
    try {
      for (const item of allocated.evicted) {
        await stopSlug(options.root, item);
      }
      const previousPid = table.routes[slug]?.pid || readPid(pidPath(options.root, slug));
      if (previousPid > 0) {
        await stopListening(previousPid, port);
      }

      const appDir = slugDir(options.root, slug);
      rmSync(appDir, { recursive: true, force: true });
      mkdirSync(appDir, { recursive: true });
      const extracted = spawnSync("tar", ["-C", appDir, "-xJf", options.archivePath], { encoding: "utf8" });
      if (extracted.status !== 0) {
        throw new PreviewError("Uitpakken van het archief mislukte.");
      }
      if (!existsSync(path.join(appDir, "server.js"))) {
        throw new PreviewError("Het archief is geen standalone server.");
      }

      startedPid = startProcess({
        cwd: appDir,
        env: appProcessEnv(config, port),
        logFile: logPath(options.root, slug),
        command: process.execPath,
        args: ["server.js"],
      });
      writePid(pidPath(options.root, slug), startedPid);

      const ready = await waitForPort(port, START_TIMEOUT_MS);
      if (!ready || !processAlive(startedPid)) {
        throw new PreviewError(startFailure(options.root, slug));
      }

      const current = readTable(options.root);
      const route = current.routes[slug];
      if (!route) {
        throw new PreviewError("De preview verdween uit de routetabel.");
      }
      route.pid = startedPid;
      current.routes[slug] = route;
      writeTable(options.root, current);

      const routerStarted = await ensureRouter(options.root, options.envFile, config);
      if (routerStarted) {
        process.stderr.write(
          `Preview-router luistert op 127.0.0.1:${config.routerPort}. De proxy stuurt *.${config.domain} daarheen en buffert /api/chat niet.\n`,
        );
      }
      return `https://${slug}.${config.domain}`;
    } catch (error) {
      if (startedPid > 0) {
        await stopListening(startedPid, port);
      }
      const current = readTable(options.root);
      writeTable(options.root, removeRoute(current, slug).table);
      rmSync(pidPath(options.root, slug), { force: true });
      throw error;
    }
  });
}

export async function removePreview(options: { branch: string; root: string }): Promise<void> {
  const slug = previewSlug(options.branch);
  if (!slug) {
    return;
  }
  const removed = await withLock(options.root, () => {
    const table = readTable(options.root);
    const result = removeRoute(table, slug);
    writeTable(options.root, result.table);
    return result.removed;
  });
  const pid = removed?.pid || readPid(pidPath(options.root, slug));
  const port = removed?.port ?? 0;
  if (pid > 0 && port > 0) {
    await stopListening(pid, port);
  } else if (pid > 0) {
    await stopListening(pid, 0);
  }
  rmSync(slugDir(options.root, slug), { recursive: true, force: true });
  rmSync(logPath(options.root, slug), { force: true });
  rmSync(pidPath(options.root, slug), { force: true });
}

export async function stopRouter(root: string): Promise<void> {
  const pid = readPid(path.join(root, "router.pid"));
  if (pid > 0) {
    await stopListening(pid, 0);
  }
  rmSync(path.join(root, "router.pid"), { force: true });
}

async function ensureRouter(root: string, envFile: string, config: PreviewConfig): Promise<boolean> {
  const pidFile = path.join(root, "router.pid");
  const pid = readPid(pidFile);
  if (pid > 0 && processAlive(pid) && (await canConnect(config.routerPort))) {
    return false;
  }
  if (await canConnect(config.routerPort)) {
    throw new PreviewError(`Poort ${config.routerPort} is bezet. De preview-router kon niet starten.`);
  }
  if (pid > 0 && processAlive(pid)) {
    await stopListening(pid, config.routerPort);
  }

  const cli = cliPath();
  const started = startProcess({
    cwd: path.dirname(cli),
    env: {
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
      PREVIEW_ROOT: root,
      PREVIEW_ENV_FILE: envFile,
    },
    logFile: path.join(root, "router.log"),
    command: process.execPath,
    args: [cli, "router"],
  });
  writePid(pidFile, started);
  if (!(await waitForPort(config.routerPort, 5_000)) || !processAlive(started)) {
    throw new PreviewError(startFailureMessage(path.join(root, "router.log"), "De preview-router startte niet."));
  }
  return true;
}

function loadProxyState(root: string, envFile: string): ProxyState {
  const config = loadPreviewConfig(envFile);
  const table = readTable(root);
  const routes: ProxyState["routes"] = {};
  for (const [slug, route] of Object.entries(table.routes)) {
    routes[slug] = { port: route.port };
  }
  return { domain: config.domain, basicAuth: config.basicAuth, routes };
}

async function assertArchive(archivePath: string): Promise<void> {
  const listed = spawnSync("tar", ["-tJf", archivePath], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (listed.status !== 0) {
    throw new PreviewError("Het archief is niet leesbaar.");
  }
  for (const entry of listed.stdout.split("\n")) {
    if (entry.length === 0) {
      continue;
    }
    if (unsafeTarEntry(entry)) {
      throw new PreviewError("Het archief bevat een pad buiten de uitpakmap.");
    }
  }
}

async function stopSlug(root: string, item: EvictedRoute): Promise<void> {
  const pid = item.pid > 0 ? item.pid : readPid(pidPath(root, item.slug));
  if (pid > 0) {
    await stopListening(pid, item.port);
  }
  rmSync(slugDir(root, item.slug), { recursive: true, force: true });
  rmSync(logPath(root, item.slug), { force: true });
  rmSync(pidPath(root, item.slug), { force: true });
}

function cliPath(): string {
  const override = process.env.PREVIEW_CLI;
  if (override && override.length > 0) {
    return override;
  }
  const current = fileURLToPath(import.meta.url);
  if (current.endsWith(`${path.sep}preview-cli.js`)) {
    return current;
  }
  const sibling = path.join(path.dirname(current), "dist", "preview-cli.js");
  if (existsSync(sibling)) {
    return sibling;
  }
  return path.join(process.cwd(), "deploy", "dist", "preview-cli.js");
}

function requireSlug(branch: string): string {
  const slug = previewSlug(branch);
  if (!slug) {
    throw new PreviewError("Deze tak krijgt geen preview. master blijft de site op de gewone host.");
  }
  return slug;
}

function slugDir(root: string, slug: string): string {
  return path.join(root, "slugs", slug);
}

function pidPath(root: string, slug: string): string {
  return path.join(root, "pids", `${slug}.pid`);
}

function logPath(root: string, slug: string): string {
  return path.join(root, "logs", `${slug}.log`);
}

function startFailure(root: string, slug: string): string {
  return startFailureMessage(logPath(root, slug), "De preview startte niet.");
}

function startFailureMessage(file: string, sentence: string): string {
  let text = "";
  try {
    text = readFileSync(file, "utf8").slice(-1500).trim();
  } catch {
    text = "";
  }
  return text.length > 0 ? `${sentence}\n${text}` : sentence;
}

async function readStdinArchive(slug: string): Promise<string> {
  if (process.stdin.isTTY) {
    throw new PreviewError("Het archief ontbreekt op stdin.");
  }
  const archivePath = path.join(tmpdir(), `portfolio-preview-${slug}-${process.pid}.tar.xz`);
  let received = 0;
  const limited = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length;
      if (received > ARCHIVE_LIMIT_BYTES) {
        callback(new PreviewError("Het archief is groter dan 200 MB."));
        return;
      }
      callback(null, chunk);
    },
  });
  try {
    await pipeline(process.stdin, limited, createWriteStream(archivePath));
  } catch (error) {
    rmSync(archivePath, { force: true });
    throw error;
  }
  return archivePath;
}

function listenRouter(): void {
  const root = previewRoot();
  const envFile = previewEnvFile();
  const server = createPreviewProxy(() => loadProxyState(root, envFile));
  const port = loadPreviewConfig(envFile).routerPort;
  server.listen(port, "127.0.0.1");
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "";
  if (command === "router") {
    listenRouter();
    return;
  }
  if (command === "slug") {
    const slug = previewSlug(process.argv[3] ?? "");
    if (!slug) {
      throw new PreviewError("Deze tak krijgt geen preview. master blijft de site op de gewone host.");
    }
    process.stdout.write(`${slug}\n`);
    return;
  }
  if (command === "down") {
    await removePreview({ branch: process.argv[3] ?? "", root: previewRoot() });
    return;
  }
  if (command === "up") {
    const branch = process.argv[3] ?? "";
    const slug = requireSlug(branch);
    loadPreviewConfig(previewEnvFile());
    const archivePath = await readStdinArchive(slug);
    try {
      const url = await publishPreview({
        branch,
        archivePath,
        root: previewRoot(),
        envFile: previewEnvFile(),
      });
      process.stdout.write(`preview-url=${url}\n`);
    } finally {
      rmSync(archivePath, { force: true });
    }
    return;
  }
  throw new PreviewError("Gebruik preview met een taknaam, of preview-remove.");
}

const isMain = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Preview mislukte.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
