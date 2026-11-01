// @vitest-environment node

import { describe, expect, it } from "vitest";
import { allocateRoute, emptyTable, parseTable, removeRoute } from "./routes.js";

describe("allocateRoute", () => {
  it("hergebruikt de poort van dezelfde tak en zet de oudste eraf", () => {
    const first = allocateRoute(emptyTable(), "filter", { max: 1, portMin: 3101, portMax: 3105, now: 1 });
    expect(first.port).toBe(3101);
    const again = allocateRoute(first.table, "filter", { max: 1, portMin: 3101, portMax: 3105, now: 2 });
    expect(again.port).toBe(3101);
    expect(again.evicted).toEqual([]);

    const second = allocateRoute(again.table, "andere", { max: 1, portMin: 3101, portMax: 3105, now: 3 });
    expect(second.evicted.map((item) => item.slug)).toEqual(["filter"]);
    expect(second.port).toBe(3101);
    expect(second.table.routes.filter).toBeUndefined();
    expect(removeRoute(second.table, "andere").table.routes).toEqual({});
  });

  it("slaat een ongeldige regel in de tabel over", () => {
    expect(parseTable({ routes: { "niet geldig": { port: 1, pid: 1, updatedAt: 1 }, filter: { port: 3101, pid: 4, updatedAt: 2 } } }).routes).toEqual({
      filter: { port: 3101, pid: 4, updatedAt: 2 },
    });
  });
});
