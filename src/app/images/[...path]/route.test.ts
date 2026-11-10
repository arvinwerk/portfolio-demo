import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET } from "./route";

describe("GET /images", () => {
  it("levert een svg zonder scriptcontext", async () => {
    const response = await GET(new Request("http://localhost/images/profile.svg"), {
      params: Promise.resolve({ path: ["profile.svg"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain("script-src 'none'");
    expect(await response.text()).toContain("<svg");
  });

  it("geeft een ontbrekend beeld geen type om te raden", async () => {
    const response = await GET(new Request("http://localhost/images/bestaat-niet.svg"), {
      params: Promise.resolve({ path: ["bestaat-niet.svg"] }),
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
