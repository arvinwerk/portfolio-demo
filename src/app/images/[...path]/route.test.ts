import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET } from "./route";

describe("GET /images", () => {
  beforeEach(() => {
    vi.stubEnv("CONTENT_DIR", "");
  });

  it("levert een svg zonder scriptrechten", async () => {
    const response = await GET(new Request("http://localhost/images/profile.svg"), {
      params: Promise.resolve({ path: ["profile.svg"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain("default-src 'none'");
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
    expect(response.headers.get("cross-origin-resource-policy")).toBe("same-origin");
  });
});
