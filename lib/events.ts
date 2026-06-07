import rawEvents from "@/data/events.json";

export type RawEvent = {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD — first occurrence; also the anchor for recurrence
  time?: string;      // HH:MM
  endTime?: string;   // HH:MM
  description?: string;
  recurring?: "weekly" | "monthly" | "monthly-nth-weekday";
  // "monthly-nth-weekday" repeats on the same Nth weekday of every month
  // (e.g. anchor 2026-06-01 → the 1st Monday of every month).
  until?: string;     // YYYY-MM-DD — last possible occurrence (inclusive)
};

export type EventInstance = RawEvent & {
  occurrenceDate: string; // YYYY-MM-DD — the date of THIS occurrence
};

const RAW: RawEvent[] = rawEvents as RawEvent[];

// Treat date strings as UK-local-midnight. Avoids the JS-Date timezone trap.
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

// 1 for 1st-of-month, 2 for 2nd, etc.
function nthWeekdayInMonth(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

// Find the Nth occurrence of a given weekday in a given month, or null if
// that month doesn't have one (e.g. asking for the 5th Friday).
function findNthWeekday(year: number, month: number, weekday: number, nth: number): Date | null {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (day > daysInMonth) return null;
  return new Date(year, month, day);
}

// Expand recurring events into concrete instances between `from` and `to` (inclusive).
export function expandEvents(from: Date, to: Date): EventInstance[] {
  const out: EventInstance[] = [];

  for (const ev of RAW) {
    const first = parseYmd(ev.date);
    const horizon = ev.until ? parseYmd(ev.until) : to;
    const stop = horizon < to ? horizon : to;

    if (!ev.recurring) {
      if (first >= from && first <= to) {
        out.push({ ...ev, occurrenceDate: ymd(first) });
      }
      continue;
    }

    if (ev.recurring === "monthly-nth-weekday") {
      const targetWeekday = first.getDay();
      const targetNth = nthWeekdayInMonth(first);
      let monthCursor = new Date(first.getFullYear(), first.getMonth(), 1);
      while (monthCursor <= stop) {
        const occ = findNthWeekday(
          monthCursor.getFullYear(),
          monthCursor.getMonth(),
          targetWeekday,
          targetNth
        );
        if (occ && occ >= first && occ >= from && occ <= stop) {
          out.push({ ...ev, occurrenceDate: ymd(occ) });
        }
        monthCursor = addMonths(monthCursor, 1);
      }
      continue;
    }

    // Walk forward from the first occurrence until we pass the window.
    let cursor = new Date(first);
    while (cursor <= stop) {
      if (cursor >= from) {
        out.push({ ...ev, occurrenceDate: ymd(cursor) });
      }
      cursor = ev.recurring === "weekly" ? addDays(cursor, 7) : addMonths(cursor, 1);
    }
  }

  out.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate));
  return out;
}

export function ymdOf(d: Date): string {
  return ymd(d);
}

export function parseYmdSafe(s: string): Date {
  return parseYmd(s);
}
