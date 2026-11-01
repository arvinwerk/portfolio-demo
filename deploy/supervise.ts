import { spawn } from "node:child_process";
import { closeSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { PreviewError } from "./errors.js";

export function startProcess(options: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  logFile: string;
  command: string;
  args: string[];
}): number {
  mkdirSync(path.dirname(options.logFile), { recursive: true });
  const logFd = openSync(options.logFile, "a");
  try {
    const child = spawn(options.command, options.args, {
      cwd: options.cwd,
      env: options.env,
      // A new session survives the SSH connection that started this preview.
      detached: true,
      stdio: ["ignore", logFd, logFd],
    });
    child.unref();
    if (!child.pid) {
      throw new PreviewError("Proces startte niet.");
    }
    return child.pid;
  } finally {
    closeSync(logFd);
  }
}

export function processAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function readPid(file: string): number {
  try {
    const value = Number(readFileSync(file, "utf8").trim());
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function writePid(file: string, pid: number): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${pid}\n`);
}

export async function stopListening(pid: number, port: number): Promise<void> {
  signal(pid, "SIGTERM");
  const started = Date.now();
  while (Date.now() - started < 5_000) {
    const listening = port > 0 ? await canConnect(port) : false;
    if (!listening && (pid <= 0 || !processAlive(pid))) {
      return;
    }
    await delay(100);
  }
  signal(pid, "SIGKILL");
  await delay(200);
}

export async function waitForPort(port: number, timeoutMs: number): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await canConnect(port)) {
      return true;
    }
    await delay(100);
  }
  return false;
}

export function canConnect(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    const done = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

function signal(pid: number, signalName: NodeJS.Signals): void {
  if (!Number.isInteger(pid) || pid <= 0) {
    return;
  }
  try {
    process.kill(-pid, signalName);
  } catch {
    try {
      process.kill(pid, signalName);
    } catch {
      // The process is already gone.
    }
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
