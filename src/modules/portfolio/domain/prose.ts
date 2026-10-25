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

export function renderForeword(template: string, age: number, yearsAsDeveloper: number): string {
  return template.replaceAll("${age}", String(age)).replaceAll("${yearsAsDeveloper}", String(yearsAsDeveloper));
}
