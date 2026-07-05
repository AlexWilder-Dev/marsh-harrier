"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { expandEvents, parseYmdSafe, ymdOf, type EventInstance } from "@/lib/events";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// Build a 6×7 grid of dates anchored on the given month, Monday-first.
function buildMonthGrid(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor);
  // JS: Sun=0, we want Mon=0
  const lead = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - lead);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function formatTime(t?: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const period = h >= 12 ? "pm" : "am";
  const h12 = ((h + 11) % 12) + 1;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

function formatEventTimeRange(ev: EventInstance): string {
  if (!ev.time) return "";
  return ev.endTime ? `${formatTime(ev.time)} – ${formatTime(ev.endTime)}` : formatTime(ev.time);
}

function formatLongDate(ymd: string): string {
  const d = parseYmdSafe(ymd);
  return `${WEEKDAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function EventsPage() {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const [monthAnchor, setMonthAnchor] = useState<Date>(startOfMonth(today));
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);

  const monthGrid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);

  // On mobile the list sits below the calendar, so pull focus to it (which also
  // scrolls it into view) whenever a date is picked.
  useEffect(() => {
    if (!selectedYmd) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches && listHeadingRef.current) {
      listHeadingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      listHeadingRef.current.focus({ preventScroll: true });
    }
  }, [selectedYmd]);

  // Expand events for the visible grid window AND for the upcoming-list window
  // (next 12 weeks from today) — whichever is wider.
  const horizon = useMemo(() => {
    const gridEnd = monthGrid[monthGrid.length - 1];
    const upcomingEnd = new Date(today);
    upcomingEnd.setDate(upcomingEnd.getDate() + 84);
    return gridEnd > upcomingEnd ? gridEnd : upcomingEnd;
  }, [monthGrid, today]);

  const allInstances = useMemo(() => {
    return expandEvents(today, horizon);
  }, [today, horizon]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, EventInstance[]>();
    for (const e of allInstances) {
      const arr = m.get(e.occurrenceDate) ?? [];
      arr.push(e);
      m.set(e.occurrenceDate, arr);
    }
    return m;
  }, [allInstances]);

  const upcoming = useMemo(() => allInstances.slice(0, 4), [allInstances]);

  // When a date is selected, the side panel filters to that day's events;
  // otherwise it shows the next few upcoming events.
  const listEvents = selectedYmd
    ? eventsByDate.get(selectedYmd) ?? []
    : upcoming;

  const toggleDate = (ymd: string) =>
    setSelectedYmd((cur) => (cur === ymd ? null : ymd));

  const todayYmd = ymdOf(today);
  const anchorYmd = ymdOf(monthAnchor);
  const monthLabel = `${MONTHS[monthAnchor.getMonth()]} ${monthAnchor.getFullYear()}`;

  return (
    <div className="min-h-screen bg-parchment">
      <Nav />

      {/* Hero strip */}
      <section className="relative bg-forest-deep pt-40 pb-16 px-6 md:px-16 lg:px-24 overflow-hidden">
        <div
          className="absolute -right-20 -bottom-32 font-serif text-[40vw] leading-none text-parchment-light/[0.04] select-none pointer-events-none"
          aria-hidden="true"
        >
          &amp;
        </div>
        <div className="relative max-w-7xl mx-auto">
          <p className="font-sans text-parchment-light/60 text-xs tracking-widest uppercase mb-5">
            What's on
          </p>
          <h1 className="font-serif font-light text-parchment-light text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            Events at the
            <br />
            <em className="italic text-ochre">Marsh Harrier.</em>
          </h1>
          <p className="font-serif italic text-parchment-light/70 text-lg md:text-xl mt-6 max-w-2xl">
            Quiz nights, Sunday roasts, live music and the odd garden party — everything coming up at the pub.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-16 md:py-24 grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20">
        {/* Calendar */}
        <section aria-label="Calendar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif font-light text-forest-deep text-2xl md:text-3xl">
              {monthLabel}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMonthAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="w-10 h-10 flex items-center justify-center border border-forest-deep/20 text-forest-deep hover:bg-forest-deep/5 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => setMonthAnchor(startOfMonth(today))}
                className="font-sans text-[11px] tracking-widest uppercase px-3 h-10 border border-forest-deep/20 text-ink/70 hover:bg-forest-deep/5 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setMonthAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1))}
                aria-label="Next month"
                className="w-10 h-10 flex items-center justify-center border border-forest-deep/20 text-forest-deep hover:bg-forest-deep/5 transition-colors"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-forest-deep/10 border border-forest-deep/10">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="bg-parchment py-2 text-center font-sans text-[10px] tracking-widest uppercase text-ink/50"
              >
                {w}
              </div>
            ))}
            {monthGrid.map((d) => {
              const cellYmd = ymdOf(d);
              const inMonth = d.getMonth() === monthAnchor.getMonth();
              const isToday = cellYmd === todayYmd;
              const isPast = cellYmd < todayYmd;
              const isSelected = cellYmd === selectedYmd;
              const dayEvents = eventsByDate.get(cellYmd) ?? [];
              return (
                <button
                  key={cellYmd}
                  type="button"
                  onClick={() => toggleDate(cellYmd)}
                  aria-pressed={isSelected}
                  aria-label={`${formatLongDate(cellYmd)}${
                    dayEvents.length
                      ? `, ${dayEvents.length} event${dayEvents.length !== 1 ? "s" : ""}`
                      : ", no events"
                  }`}
                  className={`text-left bg-parchment-light min-h-[80px] md:min-h-[96px] p-2 flex flex-col gap-1 transition-colors hover:bg-ochre/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre focus-visible:ring-inset ${
                    inMonth ? "" : "opacity-40"
                  } ${isPast && !isToday ? "opacity-50" : ""} ${
                    isSelected ? "ring-2 ring-ochre ring-inset bg-ochre/10" : ""
                  }`}
                >
                  <span
                    className={`font-sans text-xs tabular-nums ${
                      isToday
                        ? "inline-flex w-6 h-6 items-center justify-center bg-ochre text-parchment-light rounded-full font-medium"
                        : "text-ink/60"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {dayEvents.map((e) => (
                    <span
                      key={`${e.id}-${e.occurrenceDate}`}
                      className="block text-[10px] md:text-[11px] leading-tight font-sans font-medium text-forest-deep bg-ochre/15 px-1.5 py-1 truncate"
                      title={e.title}
                    >
                      {e.title}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming / selected-date list */}
        <section aria-label={selectedYmd ? "Events on selected date" : "Upcoming events"}>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2
              ref={listHeadingRef}
              tabIndex={-1}
              className="font-serif font-light text-forest-deep text-2xl md:text-3xl outline-none"
            >
              {selectedYmd ? formatLongDate(selectedYmd) : "Coming up"}
            </h2>
            {selectedYmd && (
              <button
                onClick={() => setSelectedYmd(null)}
                className="font-sans text-[11px] tracking-widest uppercase text-ochre hover:text-forest-deep transition-colors whitespace-nowrap"
              >
                Show all
              </button>
            )}
          </div>
          {listEvents.length === 0 ? (
            <p className="font-sans text-ink/50 text-sm italic">
              {selectedYmd
                ? "Nothing on this date — pick another day or view all upcoming events."
                : "Nothing on the books just yet — check back soon."}
            </p>
          ) : (
            <ol className="space-y-5">
              {listEvents.map((e) => (
                <li
                  key={`${e.id}-${e.occurrenceDate}`}
                  id={`event-${e.id}-${e.occurrenceDate}`}
                  className="border-l-2 border-ochre pl-4 py-1 scroll-mt-32"
                >
                  <p className="font-sans text-[11px] tracking-widest uppercase text-ochre">
                    {formatLongDate(e.occurrenceDate)}
                    {e.time && <span className="text-ink/40"> · {formatEventTimeRange(e)}</span>}
                  </p>
                  <h3 className="font-serif font-light text-forest-deep text-xl mt-1">
                    {e.title}
                  </h3>
                  {e.description && (
                    <p className="font-sans text-ink/70 text-sm leading-relaxed mt-1.5">
                      {e.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
