export class ProbeRejected extends Error {
  constructor(message = "Ongeldig verzoek.") {
    super(message);
    this.name = "ProbeRejected";
  }
}

const MAX_QUERY = 200;

export function readProbeQuery(value: unknown): string {
  if (typeof value !== "string") {
    throw new ProbeRejected();
  }
  const query = value.trim();
  if (!query) {
    throw new ProbeRejected();
  }
  if (query.length > MAX_QUERY) {
    throw new ProbeRejected("De zoekterm is te lang.");
  }
  return query;
}
