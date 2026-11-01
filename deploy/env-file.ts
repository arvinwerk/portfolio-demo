import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { PreviewError } from "./errors.js";

const APP_KEYS = ["AI_MODEL", "AI_API_KEY", "CONTENT_DIR", "RAG_DOCUMENT_PATH"] as const;

export type AppEnv = Partial<Record<(typeof APP_KEYS)[number], string>>;

export type BasicAuth = {
  user: string;
  password: string;
};

export type PreviewConfig = {
  domain: string;
  basicAuth: BasicAuth | undefined;
  appEnv: AppEnv;
  maxPreviews: number;
  routerPort: number;
  portMin: number;
  portMax: number;
};

export function parseEnvFile(text: string): Record<string, string> {
  if (text.length > 65_536) {
    throw new PreviewError("preview.env is te groot.");
  }

  const values: Record<string, string> = {};
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      throw new PreviewError(`Regel ${index + 1} in preview.env heeft geen sleutel.`);
    }
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new PreviewError(`Regel ${index + 1} in preview.env heeft een ongeldige sleutel.`);
    }
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    if (value.length > 4096) {
      throw new PreviewError(`De waarde van ${key} is te lang.`);
    }
    values[key] = value;
  }
  return values;
}

export function configFromValues(values: Record<string, string>): PreviewConfig {
  const domain = assertDomain(values.PREVIEW_DOMAIN ?? "");
  const basicAuth = parseBasicAuth(values.PREVIEW_BASIC_AUTH);
  const appEnv: AppEnv = {};
  for (const key of APP_KEYS) {
    const value = values[key]?.trim() ?? "";
    if (value.length > 0) {
      appEnv[key] = value;
    }
  }
  if (appEnv.AI_API_KEY && !basicAuth) {
    throw new PreviewError(
      "Zet PREVIEW_BASIC_AUTH in preview.env. De chat-sleutel staat aan en een open preview verbruikt die sleutel.",
    );
  }
  const portMin = boundedInteger(values.PREVIEW_PORT_MIN, 3101, 1, 65535, "PREVIEW_PORT_MIN");
  const portMax = boundedInteger(values.PREVIEW_PORT_MAX, 3199, 1, 65535, "PREVIEW_PORT_MAX");
  if (portMin > portMax) {
    throw new PreviewError("PREVIEW_PORT_MIN moet kleiner zijn dan of gelijk aan PREVIEW_PORT_MAX.");
  }
  return {
    domain,
    basicAuth,
    appEnv,
    maxPreviews: boundedInteger(values.PREVIEW_MAX, 5, 1, 20, "PREVIEW_MAX"),
    routerPort: boundedInteger(values.PREVIEW_ROUTER_PORT, 3080, 1, 65535, "PREVIEW_ROUTER_PORT"),
    portMin,
    portMax,
  };
}

export function loadPreviewConfig(file: string): PreviewConfig {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new PreviewError(
        `Zet ${file} naar het voorbeeld deploy/preview.env.example. PREVIEW_DOMAIN is verplicht. Staat de chat-sleutel erin, dan ook PREVIEW_BASIC_AUTH.`,
      );
    }
    throw new PreviewError(`preview.env is niet leesbaar: ${file}`);
  }
  const config = configFromValues(parseEnvFile(text));
  if (config.appEnv.CONTENT_DIR) {
    assertContentDirectory(config.appEnv.CONTENT_DIR);
  }
  return config;
}

export function assertContentDirectory(directory: string): void {
  if (!path.isAbsolute(directory)) {
    throw new PreviewError("CONTENT_DIR moet een absoluut pad zijn.");
  }
  try {
    if (!statSync(directory).isDirectory()) {
      throw new PreviewError("CONTENT_DIR moet een map zijn.");
    }
  } catch (error) {
    if (error instanceof PreviewError) {
      throw error;
    }
    throw new PreviewError("CONTENT_DIR is niet beschikbaar.");
  }
}

export function appProcessEnv(config: PreviewConfig, port: number): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "",
    NODE_ENV: "production",
    HOSTNAME: "127.0.0.1",
    PORT: String(port),
  };
  for (const [key, value] of Object.entries(config.appEnv)) {
    if (value) {
      env[key] = value;
    }
  }
  return env;
}

function assertDomain(value: string): string {
  const domain = value.trim().toLowerCase().replace(/\.$/, "");
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new PreviewError("PREVIEW_DOMAIN moet een hostnaam zijn, zonder schema of poort.");
  }
  return domain;
}

function parseBasicAuth(value: string | undefined): BasicAuth | undefined {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length === 0) {
    return undefined;
  }
  const split = trimmed.indexOf(":");
  if (split <= 0 || split === trimmed.length - 1) {
    throw new PreviewError("PREVIEW_BASIC_AUTH heeft de vorm gebruiker:wachtwoord.");
  }
  const user = trimmed.slice(0, split);
  const password = trimmed.slice(split + 1);
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(user) || password.length > 200 || /[\r\n]/.test(password)) {
    throw new PreviewError("PREVIEW_BASIC_AUTH heeft de vorm gebruiker:wachtwoord.");
  }
  return { user, password };
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number, name: string): number {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length === 0) {
    return fallback;
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new PreviewError(`${name} moet een geheel getal zijn.`);
  }
  const parsed = Number(trimmed);
  if (parsed < min || parsed > max) {
    throw new PreviewError(`${name} moet tussen ${min} en ${max} liggen.`);
  }
  return parsed;
}
