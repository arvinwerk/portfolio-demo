export const CURIOSITIES = ["portrait", "work", "thinking", "experiments", "challenge"] as const;

export type Curiosity = (typeof CURIOSITIES)[number];

export function isCuriosity(value: unknown): value is Curiosity {
  return typeof value === "string" && (CURIOSITIES as readonly string[]).includes(value);
}

export function parseCuriosity(value: unknown): Curiosity {
  const raw = Array.isArray(value) ? value[0] : value;
  return isCuriosity(raw) ? raw : "portrait";
}
