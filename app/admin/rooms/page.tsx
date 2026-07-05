"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MONTHS,
  WEEKDAYS,
  buildMonthGrid,
  startOfMonth,
  todayLocal,
  ymd,
} from "@/lib/calendar";

export default function AdminRoomsPage() {
  const router = useRouter();
  const today = useMemo(() => todayLocal(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(todayLocal()));
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => (r.ok ? r.json() : []))
      .then((dates: string[]) => setBooked(new Set(dates)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const todayYmd = ymd(today);
  const monthLabel = `${MONTHS[monthAnchor.getMonth()]} ${monthAnchor.getFullYear()}`;

  const toggle = async (date: string) => {
    if (saving.has(date)) return;
    const wasBooked = booked.has(date);

    // Optimistic update
    setBooked((prev) => {
      const next = new Set(prev);
      if (wasBooked) next.delete(date);
      else next.add(date);
      return next;
    });
    setSaving((prev) => new Set(prev).add(date));

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, booked: !wasBooked }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("save failed");
      const dates: string[] = await res.json();
      setBooked(new Set(dates));
    } catch {
      // Revert on failure
      setBooked((prev) => {
        const next = new Set(prev);
        if (wasBooked) next.add(date);
        else next.delete(date);
        return next;
      });
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(date);
        return next;
      });
    }
  };

  const upcomingBooked = useMemo(
    () => Array.from(booked).filter((d) => d >= todayYmd).length,
    [booked, todayYmd]
  );

  return (
    <div className="min-h-screen bg-parchment-dark">
      <header className="bg-ochre px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-ink text-[15px] tracking-widest uppercase">
            Room Bookings
          </p>
          <h1 className="font-serif font-light text-ink text-xl leading-tight">
            The Marsh Harrier
          </h1>
        </div>
        <a
          href="/admin"
          className="font-sans text-xs tracking-widest uppercase px-3 py-1.5 border border-ink/20 text-ink/80 hover:bg-ink/10 transition-colors"
        >
          ← Dashboard
        </a>
      </header>

      <div className="bg-parchment-light border-b border-forest-deep/10 px-4 md:px-6 py-3">
        <p className="font-sans text-sm text-forest-deep">
          Tap a date to mark it <strong className="font-medium">booked</strong>.
          Tap again to free it up. Booked nights show as unavailable on the
          public rooms calendar.
        </p>
        <p className="font-sans text-xs text-ink/50 mt-1">
          {loading ? "Loading…" : `${upcomingBooked} upcoming night${upcomingBooked !== 1 ? "s" : ""} booked`}
        </p>
      </div>

      <main className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-light text-forest-deep text-2xl">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMonthAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1))
              }
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
              onClick={() =>
                setMonthAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1))
              }
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
            const cellYmd = ymd(d);
            const inMonth = d.getMonth() === monthAnchor.getMonth();
            const isToday = cellYmd === todayYmd;
            const isPast = cellYmd < todayYmd;
            const isBooked = booked.has(cellYmd);
            const isSaving = saving.has(cellYmd);

            if (isPast) {
              return (
                <div
                  key={cellYmd}
                  className={`bg-parchment-light min-h-[64px] md:min-h-[76px] p-2 opacity-40 ${
                    inMonth ? "" : "opacity-25"
                  }`}
                >
                  <span className="font-sans text-xs tabular-nums text-ink/50">
                    {d.getDate()}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={cellYmd}
                type="button"
                onClick={() => toggle(cellYmd)}
                disabled={isSaving}
                aria-pressed={isBooked}
                aria-label={`${cellYmd}${isBooked ? ", booked" : ", available"}`}
                className={`min-h-[64px] md:min-h-[76px] p-2 flex flex-col items-start gap-1 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre focus-visible:ring-inset disabled:opacity-60 ${
                  isBooked
                    ? "bg-red-100 hover:bg-red-200"
                    : "bg-parchment-light hover:bg-ochre/10"
                } ${inMonth ? "" : "opacity-45"}`}
              >
                <span
                  className={`font-sans text-xs tabular-nums ${
                    isToday
                      ? "inline-flex w-6 h-6 items-center justify-center bg-ochre text-parchment-light rounded-full font-medium"
                      : isBooked
                      ? "text-red-800 font-medium"
                      : "text-ink/60"
                  }`}
                >
                  {d.getDate()}
                </span>
                {isBooked && (
                  <span className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase text-red-700">
                    {isSaving ? "…" : "Booked"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-5 text-xs font-sans text-ink/60">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-100 border border-red-300 inline-block" />
            Booked
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 bg-parchment-light border border-forest-deep/20 inline-block" />
            Available
          </span>
        </div>
      </main>
    </div>
  );
}
