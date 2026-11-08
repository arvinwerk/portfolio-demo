const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTHS = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

export function parseIsoDate(value: string): Date {
  const match = CALENDAR_DATE.exec(value);
  if (!match) {
    throw new Error(`Ongeldige datum: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`Ongeldige datum: ${value}`);
  }

  return date;
}

export function fullYearsBetween(later: Date, earlier: Date): number {
  let years = later.getFullYear() - earlier.getFullYear();
  const monthDelta = later.getMonth() - earlier.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && later.getDate() < earlier.getDate())) {
    years -= 1;
  }
  return Math.max(0, years);
}

export function formatDutchDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
