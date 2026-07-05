"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MONTHS,
  WEEKDAYS,
  buildMonthGrid,
  formatGBP,
  isWeekendYmd,
  longDate,
  nightlyPrice,
  startOfMonth,
  todayLocal,
  ymd,
} from "@/lib/calendar";

const toPounds = (pence: number) => (pence / 100).toFixed(2);
const parsePounds = (s: string) => Math.round(parseFloat(s) * 100);

export default function AdminRoomsPage() {
  const router = useRouter();
  const today = useMemo(() => todayLocal(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(todayLocal()));
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [weekdayPrice, setWeekdayPrice] = useState(0);
  const [weekendPrice, setWeekendPrice] = useState(0);
  const [weekdayDraft, setWeekdayDraft] = useState("0.00");
  const [weekendDraft, setWeekendDraft] = useState("0.00");
  const [savingRates, setSavingRates] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => (r.ok ? r.json() : { booked: [], prices: {} })),
      fetch("/api/settings").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([b, s]) => {
        setBooked(new Set(b.booked ?? []));
        setPrices(b.prices ?? {});
        if (s) {
          setWeekdayPrice(Number(s.roomWeekdayPrice) || 0);
          setWeekendPrice(Number(s.roomWeekendPrice) || 0);
          setWeekdayDraft(toPounds(Number(s.roomWeekdayPrice) || 0));
          setWeekendDraft(toPounds(Number(s.roomWeekendPrice) || 0));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const todayYmd = ymd(today);
  const monthLabel = `${MONTHS[monthAnchor.getMonth()]} ${monthAnchor.getFullYear()}`;

  const resolved = (date: string) =>
    nightlyPrice(date, prices, weekdayPrice, weekendPrice);

  const applyBookings = (data: { booked: string[]; prices: Record<string, number> }) => {
    setBooked(new Set(data.booked ?? []));
    setPrices(data.prices ?? {});
  };

  const saveRates = async () => {
    const wd = parsePounds(weekdayDraft);
    const we = parsePounds(weekendDraft);
    if (!Number.isFinite(wd) || wd < 0 || !Number.isFinite(we) || we < 0) return;
    setSavingRates(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomWeekdayPrice: wd, roomWeekendPrice: we }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) return;
      const s = await res.json();
      setWeekdayPrice(Number(s.roomWeekdayPrice) || 0);
      setWeekendPrice(Number(s.roomWeekendPrice) || 0);
      setWeekdayDraft(toPounds(Number(s.roomWeekdayPrice) || 0));
      setWeekendDraft(toPounds(Number(s.roomWeekendPrice) || 0));
    } finally {
      setSavingRates(false);
    }
  };

  const mutate = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) return;
      applyBookings(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const upcomingBooked = useMemo(
    () => Array.from(booked).filter((d) => d >= todayYmd).length,
    [booked, todayYmd]
  );

  const ratesDirty =
    parsePounds(weekdayDraft) !== weekdayPrice ||
    parsePounds(weekendDraft) !== weekendPrice;

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

      {/* Base nightly rates */}
      <section className="bg-parchment-light border-b border-forest-deep/10 px-4 md:px-6 py-4">
        <p className="font-sans text-[11px] tracking-widest uppercase text-ink/50 mb-3">
          Default nightly rates
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <RateInput
            label="Weekday (Mon–Fri)"
            value={weekdayDraft}
            onChange={setWeekdayDraft}
          />
          <RateInput
            label="Weekend (Sat–Sun)"
            value={weekendDraft}
            onChange={setWeekendDraft}
          />
          <button
            onClick={saveRates}
            disabled={savingRates || !ratesDirty}
            className="font-sans text-[11px] tracking-widest uppercase px-4 py-2.5 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-40 transition-colors"
          >
            {savingRates ? "Saving…" : "Save rates"}
          </button>
        </div>
        <p className="font-sans text-xs text-ink/45 mt-3 leading-relaxed">
          These apply to every night unless you override a specific date below.
          Tap a date to set a one-off price or mark it booked.
        </p>
      </section>

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
            const isSelected = cellYmd === selected;
            const price = resolved(cellYmd);
            const hasOverride = prices[cellYmd] !== undefined;

            if (isPast) {
              return (
                <div
                  key={cellYmd}
                  className={`bg-parchment-light min-h-[72px] md:min-h-[84px] p-2 opacity-40 ${
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
                onClick={() => setSelected(cellYmd)}
                aria-pressed={isSelected}
                aria-label={`${cellYmd}${isBooked ? ", booked" : `, ${price > 0 ? formatGBP(price) : "no rate"}`}`}
                className={`min-h-[72px] md:min-h-[84px] p-2 flex flex-col gap-0.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre focus-visible:ring-inset ${
                  isBooked
                    ? "bg-red-100 hover:bg-red-200"
                    : "bg-parchment-light hover:bg-ochre/10"
                } ${isSelected ? "ring-2 ring-ochre ring-inset" : ""} ${
                  inMonth ? "" : "opacity-45"
                }`}
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
                {isBooked ? (
                  <span className="font-sans text-[9px] md:text-[10px] tracking-widest uppercase text-red-700 mt-auto">
                    Booked
                  </span>
                ) : price > 0 ? (
                  <span
                    className={`font-sans text-[10px] md:text-[11px] tabular-nums mt-auto ${
                      hasOverride ? "text-ochre font-medium" : "text-forest-deep/70"
                    }`}
                  >
                    {formatGBP(price)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-sans text-ink/60">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-100 border border-red-300 inline-block" />
            Booked
          </span>
          <span className="flex items-center gap-2">
            <span className="text-ochre font-medium">£</span>
            Custom price
          </span>
          <span>
            {loading
              ? "Loading…"
              : `${upcomingBooked} upcoming night${upcomingBooked !== 1 ? "s" : ""} booked`}
          </span>
        </div>

        {selected && (
          <DateEditor
            key={selected}
            date={selected}
            booked={booked.has(selected)}
            defaultPrice={
              isWeekendYmd(selected) ? weekendPrice : weekdayPrice
            }
            overridePrice={prices[selected]}
            saving={saving}
            onClose={() => setSelected(null)}
            onToggleBooked={(next) => mutate({ date: selected, booked: next })}
            onSetPrice={(pence) => mutate({ date: selected, price: pence })}
            onResetPrice={() => mutate({ date: selected, price: null })}
          />
        )}
      </main>
    </div>
  );
}

function RateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-[10px] tracking-widest uppercase text-ink/45">
        {label}
      </span>
      <span className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-ink/50">
          £
        </span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 bg-parchment border border-forest-deep/20 text-forest-deep font-sans text-sm tabular-nums pl-7 pr-2 py-2.5 focus:outline-none focus:border-ochre/60 transition-colors"
        />
      </span>
    </label>
  );
}

function DateEditor({
  date,
  booked,
  defaultPrice,
  overridePrice,
  saving,
  onClose,
  onToggleBooked,
  onSetPrice,
  onResetPrice,
}: {
  date: string;
  booked: boolean;
  defaultPrice: number;
  overridePrice: number | undefined;
  saving: boolean;
  onClose: () => void;
  onToggleBooked: (next: boolean) => void;
  onSetPrice: (pence: number) => void;
  onResetPrice: () => void;
}) {
  const shown = overridePrice ?? defaultPrice;
  const [draft, setDraft] = useState(toPounds(shown));
  const hasOverride = overridePrice !== undefined;

  const save = () => {
    const pence = parsePounds(draft);
    if (!Number.isFinite(pence) || pence < 0) {
      setDraft(toPounds(shown));
      return;
    }
    onSetPrice(pence);
  };

  return (
    <div className="mt-5 bg-parchment-light border border-forest-deep/15 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-serif font-light text-forest-deep text-xl">
            {longDate(date)}
          </p>
          <p className="font-sans text-xs text-ink/50 mt-0.5">
            {isWeekendYmd(date) ? "Weekend rate" : "Weekday rate"} ·{" "}
            {defaultPrice > 0 ? `default ${formatGBP(defaultPrice)}` : "no default set"}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 flex items-center justify-center text-ink/40 hover:text-ink transition-colors"
        >
          ✕
        </button>
      </div>

      {booked ? (
        <div>
          <p className="font-sans text-sm text-ink/70 mb-4 leading-relaxed">
            This night is <strong className="text-red-700 font-medium">booked</strong>.
            Guests can&apos;t select it and no price is shown.
          </p>
          <button
            onClick={() => onToggleBooked(false)}
            disabled={saving}
            className="font-sans text-[11px] tracking-widest uppercase px-4 py-2.5 border border-forest-deep/25 text-forest-deep hover:bg-forest-deep/5 disabled:opacity-50 transition-colors"
          >
            {saving ? "…" : "Mark available"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[10px] tracking-widest uppercase text-ink/45">
                Price this night
              </span>
              <span className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-ink/50">
                  £
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-32 bg-parchment border border-forest-deep/20 text-forest-deep font-sans text-sm tabular-nums pl-7 pr-2 py-2.5 focus:outline-none focus:border-ochre/60 transition-colors"
                />
              </span>
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="font-sans text-[11px] tracking-widest uppercase px-4 py-2.5 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-50 transition-colors"
            >
              {saving ? "…" : "Save price"}
            </button>
            {hasOverride && (
              <button
                onClick={onResetPrice}
                disabled={saving}
                className="font-sans text-[11px] tracking-widest uppercase px-3 py-2.5 text-ink/50 hover:text-ink disabled:opacity-50 transition-colors"
              >
                Use default
              </button>
            )}
          </div>
          {hasOverride && (
            <p className="font-sans text-[10px] tracking-widest uppercase text-ochre">
              Custom price set for this night
            </p>
          )}
          <div className="pt-1 border-t border-forest-deep/10">
            <button
              onClick={() => onToggleBooked(true)}
              disabled={saving}
              className="mt-3 font-sans text-[11px] tracking-widest uppercase px-4 py-2.5 border border-red-400/40 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {saving ? "…" : "Mark as booked"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
