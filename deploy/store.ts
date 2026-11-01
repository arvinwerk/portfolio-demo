import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PreviewError } from "./errors.js";
import { emptyTable, parseTable, type RouteTable } from "./routes.js";
import { delay, processAlive, readPid } from "./supervise.js";

export function readTable(root: string): RouteTable {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path.join(root, "routes.json"), "utf8"));
    return parseTable(parsed);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return emptyTable();
    }
    if (error instanceof SyntaxError) {
      throw new PreviewError("routes.json is niet leesbaar.");
    }
    throw error;
  }
}

export function writeTable(root: string, table: RouteTable): void {
  mkdirSync(root, { recursive: true });
  const file = path.join(root, "routes.json");
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(table)}\n`);
  renameSync(temporary, file);
}

export async function withLock<T>(root: string, body: () => Promise<T> | T): Promise<T> {
  const lock = path.join(root, ".lock");
  const started = Date.now();
  mkdirSync(root, { recursive: true });
  for (;;) {
    try {
      mkdirSync(lock);
      writeFileSync(path.join(lock, "pid"), `${process.pid}\n`);
      break;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") {
        throw error;
      }
      const owner = readPid(path.join(lock, "pid"));
      if (owner === 0 || !processAlive(owner)) {
        rmSync(lock, { recursive: true, force: true });
        continue;
      }
      if (Date.now() - started > 120_000) {
        throw new PreviewError("Preview-vergrendeling bleef bezet.");
      }
      await delay(50);
    }
  }

  try {
    return await body();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}
