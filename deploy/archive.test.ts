// @vitest-environment node

import { describe, expect, it } from "vitest";
import { unsafeTarEntry } from "./archive.js";

describe("unsafeTarEntry", () => {
  it("weigert een pad dat uit de uitpakmap loopt", () => {
    expect(unsafeTarEntry("server.js")).toBe(false);
    expect(unsafeTarEntry("./public/images/profile.svg")).toBe(false);
    expect(unsafeTarEntry("content/personal.json")).toBe(false);
    expect(unsafeTarEntry("../etc/passwd")).toBe(true);
    expect(unsafeTarEntry("foo/../../etc/passwd")).toBe(true);
    expect(unsafeTarEntry("/etc/passwd")).toBe(true);
    expect(unsafeTarEntry("C:/Windows/system32")).toBe(true);
    expect(unsafeTarEntry("")).toBe(true);
  });
});
