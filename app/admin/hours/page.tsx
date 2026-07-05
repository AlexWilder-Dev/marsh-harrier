"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_OPENING_HOURS, type OpeningHour } from "@/lib/openingHours";

export default function AdminHoursPage() {
  const router = useRouter();
  const [hours, setHours] = useState<OpeningHour[]>(DEFAULT_OPENING_HOURS);
  const [original, setOriginal] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/opening-hours")
      .then((r) => (r.ok ? r.json() : DEFAULT_OPENING_HOURS))
      .then((data: OpeningHour[]) => {
        const sorted = [...data].sort((a, b) => a.order - b.order);
        setHours(sorted);
        setOriginal(JSON.stringify(sorted));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(hours) !== original,
    [hours, original]
  );

  const update = (order: number, field: keyof OpeningHour, value: string) => {
    setSaved(false);
    setHours((prev) =>
      prev.map((h) => (h.order === order ? { ...h, [field]: value } : h))
    );
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/opening-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) return;
      const data: OpeningHour[] = await res.json();
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setHours(sorted);
      setOriginal(JSON.stringify(sorted));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment-dark flex items-center justify-center">
        <p className="font-sans text-ink/40 text-sm">Loading hours…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-dark">
      <header className="bg-ochre px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-ink text-[15px] tracking-widest uppercase">
            Opening Hours
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
          Edit the bar and kitchen times shown on the website. Times are free
          text — write them however reads best (e.g. <em>12pm – 11pm</em>,{" "}
          <em>noon–3pm &amp; 6–9pm</em>, or <em>Closed</em>).
        </p>
      </div>

      <main className="p-4 md:p-6 max-w-3xl mx-auto space-y-3">
        {hours.map((row) => (
          <section
            key={row.order}
            className="bg-parchment-light border border-forest-deep/10 p-4"
          >
            <p className="font-serif font-light text-forest-deep text-lg mb-3">
              {row.day}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Bar hours"
                value={row.bar}
                placeholder="12pm – 11pm"
                onChange={(v) => update(row.order, "bar", v)}
              />
              <Field
                label="Kitchen hours"
                value={row.kitchen}
                placeholder="noon–3pm & 6–9pm"
                onChange={(v) => update(row.order, "kitchen", v)}
              />
            </div>
            <div className="mt-3">
              <Field
                label="Note (optional)"
                value={row.note ?? ""}
                placeholder="e.g. Roasts only · Bank holiday hours"
                onChange={(v) => update(row.order, "note", v)}
              />
            </div>
          </section>
        ))}
      </main>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-parchment-light border-t border-forest-deep/15 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <p className="font-sans text-xs text-ink/50">
          {saved
            ? "✓ Saved — live on the website"
            : dirty
            ? "Unsaved changes"
            : "All changes saved"}
        </p>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="font-sans text-[11px] tracking-widest uppercase px-5 py-2.5 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving…" : "Save hours"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-[10px] tracking-widest uppercase text-ink/45">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-parchment border border-forest-deep/20 text-forest-deep font-sans text-sm px-3 py-2.5 placeholder-ink/30 focus:outline-none focus:border-ochre/60 transition-colors"
      />
    </label>
  );
}
