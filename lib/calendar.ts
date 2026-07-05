// Shared, timezone-safe calendar helpers used by the rooms booking picker and
// the admin bookings manager. Dates are treated as UK-local-midnight and passed
// around as "YYYY-MM-DD" strings to avoid the JS-Date timezone trap.

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isYmd(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Local midnight for today — strips the time component.
export function todayLocal(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

// A 6×7 grid of dates anchored on the given month, Monday-first.
export function buildMonthGrid(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor);
  const lead = (first.getDay() + 6) % 7; // JS Sun=0 → shift so Mon=0
  const gridStart = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

// Every "YYYY-MM-DD" from startYmd (inclusive) up to endYmd. When
// `exclusiveEnd` is true the final date is omitted — the convention for a stay,
// where check-out day is not itself an occupied night.
export function datesInRange(
  startYmd: string,
  endYmd: string,
  exclusiveEnd = false
): string[] {
  const out: string[] = [];
  let cursor = parseYmd(startYmd);
  const end = parseYmd(endYmd);
  while (exclusiveEnd ? cursor < end : cursor <= end) {
    out.push(ymd(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
}

export function longDate(ymdStr: string): string {
  const d = parseYmd(ymdStr);
  return `${WEEKDAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
