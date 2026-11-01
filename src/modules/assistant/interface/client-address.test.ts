import { describe, expect, it } from "vitest";
import { clientAddress } from "./client-address";

describe("clientAddress", () => {
  it("pakt het echte adres en anders de hop die de proxy toevoegde", () => {
    expect(clientAddress(new Request("http://localhost/api/chat", { headers: { "x-real-ip": "203.0.113.8" } }))).toBe(
      "203.0.113.8",
    );
    expect(
      clientAddress(
        new Request("http://localhost/api/chat", { headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } }),
      ),
    ).toBe("10.0.0.1");
    expect(
      clientAddress(
        new Request("http://localhost/api/chat", { headers: { "x-forwarded-for": "203.0.113.9, niet-een-ip" } }),
      ),
    ).toBe("203.0.113.9");
    expect(clientAddress(new Request("http://localhost/api/chat", { headers: { "x-forwarded-for": "niet-een-ip" } }))).toBe(
      "onbekend",
    );
    expect(
      clientAddress(
        new Request("http://localhost/api/chat", {
          headers: { "x-real-ip": "198.51.100.4", "x-forwarded-for": "203.0.113.9" },
        }),
      ),
    ).toBe("198.51.100.4");
  });
});
