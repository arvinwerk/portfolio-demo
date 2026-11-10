export function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function displayUrl(value: string): string {
  try {
    const url = new URL(value);
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.host}${path}`;
  } catch {
    return value;
  }
}

export function renderForeword(template: string, age: number | null, yearsAsDeveloper: number): string {
  if (template.includes("${age}") && age == null) {
    throw new Error("Het voorwoord noemt een leeftijd, maar er is geen geboortedatum.");
  }

  return template
    .replaceAll("${age}", age == null ? "" : String(age))
    .replaceAll("${yearsAsDeveloper}", String(yearsAsDeveloper));
}
