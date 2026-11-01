import { PreviewError } from "./errors.js";
import { isSlug } from "./slug.js";

export type RouteRecord = {
  port: number;
  pid: number;
  updatedAt: number;
};

export type RouteTable = {
  routes: Record<string, RouteRecord>;
};

export type EvictedRoute = RouteRecord & { slug: string };

export function emptyTable(): RouteTable {
  return { routes: {} };
}

export function parseTable(value: unknown): RouteTable {
  if (typeof value !== "object" || value === null || !("routes" in value)) {
    return emptyTable();
  }
  const routesValue = (value as { routes?: unknown }).routes;
  if (typeof routesValue !== "object" || routesValue === null) {
    return emptyTable();
  }

  const routes: Record<string, RouteRecord> = {};
  for (const [slug, record] of Object.entries(routesValue)) {
    if (!isSlug(slug) || typeof record !== "object" || record === null) {
      continue;
    }
    const candidate = record as { port?: unknown; pid?: unknown; updatedAt?: unknown };
    if (typeof candidate.port !== "number" || candidate.port < 1 || candidate.port > 65535) {
      continue;
    }
    if (typeof candidate.pid !== "number" || !Number.isInteger(candidate.pid) || candidate.pid < 0) {
      continue;
    }
    if (typeof candidate.updatedAt !== "number" || !Number.isInteger(candidate.updatedAt)) {
      continue;
    }
    routes[slug] = { port: candidate.port, pid: candidate.pid, updatedAt: candidate.updatedAt };
  }
  return { routes };
}

export function allocateRoute(
  table: RouteTable,
  slug: string,
  options: { max: number; portMin: number; portMax: number; now: number },
): { table: RouteTable; port: number; evicted: EvictedRoute[] } {
  const routes: Record<string, RouteRecord> = { ...table.routes };
  const existing = routes[slug];
  const evicted: EvictedRoute[] = [];

  if (!existing) {
    const ordered = Object.entries(routes).sort((left, right) => left[1].updatedAt - right[1].updatedAt);
    while (Object.keys(routes).length >= options.max) {
      const oldest = ordered.shift();
      if (!oldest) {
        break;
      }
      const [name, record] = oldest;
      delete routes[name];
      evicted.push({ slug: name, ...record });
    }
  }

  const port = existing?.port ?? freePort(routes, options.portMin, options.portMax);
  if (port === undefined) {
    throw new PreviewError("Geen vrije preview-poort.");
  }
  routes[slug] = {
    port,
    pid: existing?.pid ?? 0,
    updatedAt: options.now,
  };
  return { table: { routes }, port, evicted };
}

export function removeRoute(table: RouteTable, slug: string): { table: RouteTable; removed: EvictedRoute | undefined } {
  const existing = table.routes[slug];
  if (!existing) {
    return { table, removed: undefined };
  }
  const routes = { ...table.routes };
  delete routes[slug];
  return { table: { routes }, removed: { slug, ...existing } };
}

function freePort(routes: Record<string, RouteRecord>, min: number, max: number): number | undefined {
  const used = new Set(Object.values(routes).map((route) => route.port));
  for (let port = min; port <= max; port += 1) {
    if (!used.has(port)) {
      return port;
    }
  }
  return undefined;
}
