import { describe, expect, it } from "vitest";
import { sanitizePublicText } from "./sanitize";

describe("sanitizePublicText", () => {
  it("haalt sleutels, adressen en paden weg", () => {
    const clean = sanitizePublicText(`Voorstel.
-----BEGIN PRIVATE KEY-----
geheim
-----END PRIVATE KEY-----
AI_API_KEY=supersecret
Bearer abcdefghijklmnop
sk-ant-api03-abcdefghijklmnopqrstuvwxyz
mail noor.linden@example.com
host 136.144.146.87
pad /home/arvinwerk/portfolio/.env
postgres://user:secret@localhost/db`);

    expect(clean).not.toContain("supersecret");
    expect(clean).not.toContain("abcdefghijklmnop");
    expect(clean).not.toContain("sk-ant-");
    expect(clean).not.toContain("example.com");
    expect(clean).not.toContain("136.144.146.87");
    expect(clean).not.toContain("/home/");
    expect(clean).not.toContain("postgres://");
    expect(clean).toContain("[e-mail]");
    expect(clean).toContain("[adres]");
    expect(clean).toContain("[pad]");
    expect(clean).toContain("Voorstel.");
  });
});
