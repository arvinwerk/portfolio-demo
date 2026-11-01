// @vitest-environment node

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PreviewError } from "./errors.js";
import { appProcessEnv, configFromValues, loadPreviewConfig, parseEnvFile } from "./env-file.js";

describe("preview.env", () => {
  it("leest het domein, de afscherming en de app-variabelen", () => {
    const values = parseEnvFile(`
# commentaar
PREVIEW_DOMAIN=Preview.Example.NL.
PREVIEW_BASIC_AUTH="bezoeker:geheim"
AI_MODEL='claude'
AI_API_KEY=sleutel
PREVIEW_MAX=2
`);
    const config = configFromValues(values);
    expect(config.domain).toBe("preview.example.nl");
    expect(config.basicAuth).toEqual({ user: "bezoeker", password: "geheim" });
    expect(config.appEnv).toEqual({ AI_MODEL: "claude", AI_API_KEY: "sleutel" });
    expect(config.maxPreviews).toBe(2);
    expect(config.routerPort).toBe(3080);
    expect(appProcessEnv(config, 3101).PREVIEW_BASIC_AUTH).toBeUndefined();
    expect(appProcessEnv(config, 3101)).toMatchObject({
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: "3101",
      AI_API_KEY: "sleutel",
    });
  });

  it("weigert een open preview zodra de chat-sleutel gezet is", () => {
    expect(() => configFromValues({ PREVIEW_DOMAIN: "preview.example.nl", AI_API_KEY: "sleutel" })).toThrow(PreviewError);
    expect(() => configFromValues({ PREVIEW_DOMAIN: "https://preview.example.nl" })).toThrow(/PREVIEW_DOMAIN/);
    expect(() => configFromValues({ PREVIEW_DOMAIN: "preview.example.nl", PREVIEW_BASIC_AUTH: "zonder-wachtwoord" })).toThrow(
      /PREVIEW_BASIC_AUTH/,
    );
  });

  it("weigert een CONTENT_DIR die er niet is", () => {
    const root = mkdtempSync(path.join(tmpdir(), "preview-env-"));
    const file = path.join(root, "preview.env");
    writeFileSync(file, `PREVIEW_DOMAIN=preview.example.nl\nCONTENT_DIR=${path.join(root, "ontbreekt")}\n`);
    expect(() => loadPreviewConfig(file)).toThrow(/CONTENT_DIR/);
    expect(() => loadPreviewConfig(path.join(root, "weg.env"))).toThrow(/preview\.env\.example/);
  });
});
