import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = path.join(process.cwd(), "src");

const layers = ["domain", "application", "infrastructure", "interface"] as const;

type Place =
  | { kind: "app" }
  | { kind: "kernel" }
  | { kind: "facade"; context: string; file: string }
  | { kind: "layer"; context: string; layer: (typeof layers)[number] }
  | { kind: "other" };

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) {
      return walk(full);
    }
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

function placeOf(file: string): Place {
  const relative = path.relative(sourceRoot, file).split(path.sep);
  if (relative[0] === "app") {
    return { kind: "app" };
  }
  if (relative[0] === "shared") {
    return { kind: "kernel" };
  }
  if (relative[0] === "modules" && relative.length === 3) {
    return { kind: "facade", context: relative[1], file: relative[2] };
  }
  if (relative[0] === "modules" && relative.length > 3 && layers.includes(relative[2] as (typeof layers)[number])) {
    return { kind: "layer", context: relative[1], layer: relative[2] as (typeof layers)[number] };
  }
  return { kind: "other" };
}

function importsOf(source: string): string[] {
  const found: string[] = [];
  const pattern = /(?:import|export)\s+(?:type\s+)?(?:[^"'`;]*?\s+from\s+)?["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    found.push(match[1]);
  }
  const sideEffect = /import\s+["']([^"']+)["']/g;
  for (const match of source.matchAll(sideEffect)) {
    found.push(match[1]);
  }
  return found;
}

function resolveImport(fromFile: string, specifier: string): string | undefined {
  if (specifier.startsWith("@/")) {
    return path.join(sourceRoot, specifier.slice(2));
  }
  if (specifier.startsWith(".")) {
    return path.resolve(path.dirname(fromFile), specifier);
  }
  return undefined;
}

const vendorBannedInModel = ["react", "next", "server-only", "node:fs", "node:crypto", "ai", "zod"];

function vendorBanned(layer: Place, specifier: string): string | undefined {
  const pkg = specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0];
  if (layer.kind === "layer" && (layer.layer === "domain" || layer.layer === "application")) {
    if (vendorBannedInModel.some((name) => pkg === name || specifier.startsWith(`${name}/`) || specifier.startsWith("@ai-sdk/") || specifier.startsWith("@langchain/"))) {
      return specifier;
    }
  }
  if (layer.kind === "kernel" && vendorBannedInModel.some((name) => pkg === name || specifier.startsWith("@langchain/") || specifier.startsWith("@ai-sdk/"))) {
    return specifier;
  }
  if (layer.kind === "layer" && layer.layer === "infrastructure") {
    if (pkg === "react" || pkg === "next" || specifier.startsWith("@langchain/react")) {
      return specifier;
    }
  }
  if (layer.kind === "layer" && layer.layer === "interface") {
    if (pkg === "node:fs" || pkg === "node:crypto" || specifier.startsWith("@langchain/") || specifier === "@ai-sdk/anthropic") {
      return specifier;
    }
  }
  return undefined;
}

describe("afhankelijkheidsregel", () => {
  const files = walk(sourceRoot).filter((file) => !file.endsWith(`${path.sep}architecture.test.ts`));

  it("houdt lagen, contexten en de compositie-root uit elkaars spullen", () => {
    const violations: string[] = [];

    for (const file of files) {
      const place = placeOf(file);
      const source = readFileSync(file, "utf8");
      const client = source.startsWith('"use client"') || source.startsWith("'use client'");

      for (const specifier of importsOf(source)) {
        const banned = vendorBanned(place, specifier);
        if (banned) {
          violations.push(`${path.relative(sourceRoot, file)} importeert ${banned}`);
        }

        const resolved = resolveImport(file, specifier);
        if (!resolved) {
          if (place.kind === "app" && specifier.startsWith("@/modules/")) {
            const allowed = new Set([
              "@/modules/portfolio",
              "@/modules/portfolio/server",
              "@/modules/assistant",
              "@/modules/assistant/server",
            ]);
            if (!allowed.has(specifier)) {
              violations.push(`${path.relative(sourceRoot, file)} importeert ${specifier} buiten de facade`);
            }
          }
          continue;
        }

        const target = placeOf(resolved.endsWith(".ts") || resolved.endsWith(".tsx") ? resolved : `${resolved}.ts`);
        const targetPlace = statSafe(resolved) ? placeOf(existingFile(resolved)) : target;

        if (client && (specifier.includes("/infrastructure/") || specifier.endsWith("/server") || specifier.includes("server-only"))) {
          violations.push(`${path.relative(sourceRoot, file)} is een clientcomponent en importeert ${specifier}`);
        }

        if (place.kind === "layer" && targetPlace.kind === "layer" && place.context !== targetPlace.context) {
          violations.push(`${path.relative(sourceRoot, file)} kruist naar ${targetPlace.context}`);
        }
        if (place.kind === "layer" && targetPlace.kind === "facade" && place.context !== targetPlace.context) {
          violations.push(`${path.relative(sourceRoot, file)} kruist naar ${targetPlace.context}`);
        }

        if (place.kind === "layer" && targetPlace.kind === "layer" && place.context === targetPlace.context) {
          const from = place.layer;
          const to = targetPlace.layer;
          const allowed =
            (from === "application" && to === "domain") ||
            (from === "infrastructure" && (to === "domain" || to === "application")) ||
            (from === "interface" && (to === "domain" || to === "application")) ||
            from === to;
          if (!allowed) {
            violations.push(`${path.relative(sourceRoot, file)} (${from}) importeert ${to}`);
          }
        }

        if (place.kind === "facade" && place.file === "index.ts") {
          const inside =
            (targetPlace.kind === "layer" && targetPlace.context === place.context && (targetPlace.layer === "domain" || targetPlace.layer === "interface")) ||
            (targetPlace.kind === "facade" && targetPlace.context === place.context);
          if (targetPlace.kind !== "other" && !inside && targetPlace.kind !== "kernel") {
            violations.push(`index van ${place.context} importeert ${specifier}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

function statSafe(file: string): boolean {
  const candidates = [file, `${file}.ts`, `${file}.tsx`, path.join(file, "index.ts"), path.join(file, "index.tsx")];
  return candidates.some((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

function existingFile(file: string): string {
  const candidates = [file, `${file}.ts`, `${file}.tsx`, path.join(file, "index.ts"), path.join(file, "index.tsx")];
  const found = candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
  if (!found) {
    throw new Error(`Import niet gevonden: ${file}`);
  }
  return found;
}
