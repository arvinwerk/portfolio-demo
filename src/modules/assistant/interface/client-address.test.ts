import { describe, expect, it } from "vitest";
import { clientAddress } from "./client-address";

describe("clientAddress", () => {
  it("pakt het echte adres en anders de eerste hop", () => {
    expect(clientAddress(new Request("http://localhost/api/chat", { headers: { "x-real-ip": "203.0.113.8" } }))).toBe(
      "203.0.113.8",
    );
    expect(
      clientAddress(
        new Request("http://localhost/api/chat", { headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } }),
      ),
    ).toBe("203.0.113.9");
    expect(clientAddress(new Request("http://localhost/api/chat", { headers: { "x-forwarded-for": "niet-een-ip" } }))).toBe(
      "onbekend",
    );
  });
});
