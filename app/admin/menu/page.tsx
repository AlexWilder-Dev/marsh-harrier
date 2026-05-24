"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: number;
  category: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
};

type OverrideRow = {
  menu_id: number;
  available: number | null;
  description: string | null;
};

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default function AdminMenuPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [overrides, setOverrides] = useState<Map<number, OverrideRow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/menu").then((r) => r.json()),
      fetch("/api/menu/overrides").then(async (r) => {
        if (r.status === 401) {
          router.replace("/admin/login");
          return [];
        }
        return r.ok ? r.json() : [];
      }),
    ])
      .then(([menuData, overridesData]: [MenuItem[], OverrideRow[]]) => {
        setMenu(menuData);
        setOverrides(
          new Map(overridesData.map((o) => [Number(o.menu_id), o]))
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q)
    );
  }, [menu, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const it of filtered) {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category)!.push(it);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const saveOverride = async (
    menuId: number,
    patch: { available?: boolean | null; description?: string | null }
  ) => {
    setSavingId(menuId);
    try {
      const res = await fetch("/api/menu/overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, ...patch }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setOverrides((prev) => {
        const next = new Map(prev);
        if (updated.available === null && updated.description === null) {
          next.delete(menuId);
        } else {
          next.set(menuId, {
            menu_id: menuId,
            available: updated.available === null ? null : (updated.available ? 1 : 0),
            description: updated.description,
          });
        }
        return next;
      });
    } finally {
      setSavingId(null);
    }
  };

  // What the customer sees right now, accounting for overrides
  const resolvedAvailable = (it: MenuItem) => {
    const o = overrides.get(it.id);
    if (o && o.available !== null) return Number(o.available) === 1;
    return it.available;
  };
  const resolvedDescription = (it: MenuItem) => {
    const o = overrides.get(it.id);
    if (o && o.description !== null) return o.description;
    return it.description;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment-dark flex items-center justify-center">
        <p className="font-sans text-ink/40 text-sm">Loading menu…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-dark">
      <header className="bg-ochre px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-ink text-[15px] tracking-widest uppercase">
            Menu Manager
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

      <div className="bg-parchment-light border-b border-forest-deep/10 px-4 md:px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Filter menu…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-parchment border border-forest-deep/20 text-forest-deep font-sans text-sm px-3 py-2 placeholder-ink/30 focus:outline-none focus:border-ochre/60 transition-colors"
          />
          <span className="font-sans text-xs text-ink/50 tabular-nums">
            {filtered.length}/{menu.length}
          </span>
        </div>
      </div>

      <main className="p-4 md:p-6 space-y-3">
        {grouped.length === 0 && (
          <p className="font-sans text-ink/40 text-sm text-center py-12">
            No items match.
          </p>
        )}
        {grouped.map(([category, items]) => {
          const isOpen = openCategories.has(category) || filter.trim() !== "";
          return (
            <section
              key={category}
              className="bg-parchment-light border border-forest-deep/10"
            >
              <button
                onClick={() =>
                  setOpenCategories((prev) => {
                    const next = new Set(prev);
                    if (next.has(category)) next.delete(category);
                    else next.add(category);
                    return next;
                  })
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-parchment transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif font-light text-forest-deep text-lg">
                    {category}
                  </span>
                  <span className="font-sans text-xs text-ink/40 tabular-nums">
                    {items.length}
                  </span>
                </div>
                <span
                  className={`text-ink/40 text-xs transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <ul className="divide-y divide-forest-deep/5 border-t border-forest-deep/10">
                  {items.map((it) => {
                    const available = resolvedAvailable(it);
                    const description = resolvedDescription(it);
                    const hasOverride = overrides.has(it.id);
                    const isSaving = savingId === it.id;
                    return (
                      <li key={it.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-sm font-medium text-forest-deep">
                              {it.name}
                              <span className="ml-2 font-sans text-xs text-ink/40 tabular-nums">
                                {formatPrice(it.price)}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              saveOverride(it.id, { available: !available })
                            }
                            disabled={isSaving}
                            className={`font-sans text-[11px] tracking-widest uppercase px-3 py-1.5 transition-colors flex-shrink-0 disabled:opacity-50 ${
                              available
                                ? "bg-ochre text-parchment-light hover:bg-ochre-light"
                                : "border border-red-400/40 text-red-700 bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {isSaving
                              ? "…"
                              : available
                              ? "Available"
                              : "Hidden"}
                          </button>
                        </div>
                        <DescriptionEditor
                          initial={description}
                          original={it.description}
                          onSave={(text) =>
                            saveOverride(it.id, {
                              description: text === it.description ? null : text,
                            })
                          }
                        />
                        {hasOverride && (
                          <div className="mt-2 flex items-center justify-between">
                            <p className="font-sans text-[10px] tracking-widest uppercase text-ochre">
                              Override active
                            </p>
                            <button
                              onClick={() =>
                                saveOverride(it.id, {
                                  available: null,
                                  description: null,
                                })
                              }
                              disabled={isSaving}
                              className="font-sans text-[10px] tracking-widest uppercase text-ink/40 hover:text-ink/70 transition-colors"
                            >
                              Reset to default
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}

function DescriptionEditor({
  initial,
  original,
  onSave,
}: {
  initial: string;
  original: string;
  onSave: (text: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);

  // Keep local value in sync if parent re-renders with a new initial
  useEffect(() => {
    if (!editing) setValue(initial);
  }, [initial, editing]);

  const dirty = value !== initial;

  return (
    <div>
      <textarea
        value={value}
        rows={2}
        onFocus={() => setEditing(true)}
        onBlur={() => {
          setEditing(false);
          if (dirty) onSave(value);
        }}
        onChange={(e) => setValue(e.target.value)}
        placeholder={original || "No description"}
        className="w-full bg-parchment border border-forest-deep/15 text-ink font-sans text-xs px-3 py-2 placeholder-ink/30 focus:outline-none focus:border-ochre/60 transition-colors resize-none"
      />
      {dirty && (
        <p className="font-sans text-[10px] text-ink/40 mt-1">
          Click outside to save.
        </p>
      )}
    </div>
  );
}
