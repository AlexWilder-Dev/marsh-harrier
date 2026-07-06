"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  parentId?: number;
  dealOf2Price?: number;
};

function itemLineTotal(item: OrderItem): number {
  if (item.dealOf2Price && item.quantity >= 2) {
    const pairs = Math.floor(item.quantity / 2);
    const remainder = item.quantity % 2;
    return pairs * item.dealOf2Price + remainder * item.price;
  }
  return item.price * item.quantity;
}

type Settings = {
  ordersPaused: boolean;
  drinkDelayMinutes: number;
};

const DRINK_DELAY_OPTIONS = [0, 5, 10, 15, 20] as const;

type Order = {
  id: number;
  table_number: number;
  items: OrderItem[];
  status: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  discount_percent?: number;
  discount_reason?: string | null;
};

const DISCOUNT_PRESETS: Array<{ label: string; percent: number; reason: string }> = [
  { label: "Student 10%", percent: 10, reason: "Student" },
  { label: "NHS 10%", percent: 10, reason: "NHS" },
];

type Table = {
  id: number;
  table_number: number;
  status: string;
  opened_at: string;
  closed_at: string | null;
  pending_count: number;
};

type DashboardData = {
  tables: Table[];
  orders: Order[];
};

const POLL_INTERVAL = 12_000;

function minutesOpen(openedAt: string): number {
  return Math.floor(
    (Date.now() - new Date(openedAt + "Z").getTime()) / 60_000
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(iso: string): string {
  return new Date(iso + "Z").toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function staleLevel(minutes: number): "ok" | "amber" | "red" {
  if (minutes >= 180) return "red";
  if (minutes >= 120) return "amber";
  return "ok";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [closingTable, setClosingTable] = useState<number | null>(null);
  const [deliveringOrder, setDeliveringOrder] = useState<number | null>(null);
  const [discountingOrder, setDiscountingOrder] = useState<number | null>(null);
  const [discountPickerFor, setDiscountPickerFor] = useState<number | null>(null);
  const [closingAll, setClosingAll] = useState(false);
  const [offline, setOffline] = useState(false);
  const [settings, setSettings] = useState<Settings>({ ordersPaused: false, drinkDelayMinutes: 0 });
  const [savingSetting, setSavingSetting] = useState<"pause" | "delay" | null>(null);
  const [initState, setInitState] = useState<"idle" | "running" | "done" | "error">("idle");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/tables");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      if (!document.hidden) fetchData();
    }, POLL_INTERVAL);
    const onVisible = () => { if (!document.hidden) fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSettings({
            ordersPaused: Boolean(data.ordersPaused),
            drinkDelayMinutes: Number(data.drinkDelayMinutes) || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const updateSettings = async (
    patch: Partial<Settings>,
    kind: "pause" | "delay"
  ) => {
    setSavingSetting(kind);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          ordersPaused: Boolean(data.ordersPaused),
          drinkDelayMinutes: Number(data.drinkDelayMinutes) || 0,
        });
      }
    } finally {
      setSavingSetting(null);
    }
  };

  const runInit = async () => {
    if (!confirm("Run database setup? Safe to run more than once.")) return;
    setInitState("running");
    try {
      const res = await fetch("/api/init", { method: "POST" });
      if (!res.ok) throw new Error();
      setInitState("done");
      // Re-fetch settings now that the table exists
      const s = await fetch("/api/settings");
      if (s.ok) {
        const data = await s.json();
        setSettings({
          ordersPaused: Boolean(data.ordersPaused),
          drinkDelayMinutes: Number(data.drinkDelayMinutes) || 0,
        });
      }
    } catch {
      setInitState("error");
    }
  };

  const markDelivered = async (orderId: number) => {
    setDeliveringOrder(orderId);
    try {
      await fetch(`/api/orders/${orderId}/deliver`, { method: "PUT" });
      await fetchData();
    } finally {
      setDeliveringOrder(null);
    }
  };

  const applyDiscount = async (
    orderId: number,
    percent: number,
    reason: string | null
  ) => {
    setDiscountingOrder(orderId);
    try {
      await fetch(`/api/orders/${orderId}/discount`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent, reason }),
      });
      setDiscountPickerFor(null);
      await fetchData();
    } finally {
      setDiscountingOrder(null);
    }
  };

  const promptCustomDiscount = (orderId: number) => {
    const raw = window.prompt("Discount percent (1–100)?");
    if (raw === null) return;
    const percent = Number(raw);
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      alert("Enter a number between 1 and 100.");
      return;
    }
    const reason = window.prompt("Reason (optional, e.g. 'Locals night')") ?? "";
    applyDiscount(orderId, Math.round(percent), reason.trim() || null);
  };

  const closeTable = async (tableNumber: number) => {
    setClosingTable(tableNumber);
    try {
      await fetch(`/api/tables/${tableNumber}/close`, { method: "PUT" });
      await fetchData();
    } finally {
      setClosingTable(null);
    }
  };

  const closeAll = async () => {
    if (!confirm("Close all tables? This will end service for everyone."))
      return;
    setClosingAll(true);
    try {
      await fetch("/api/tables/close-all", { method: "PUT" });
      await fetchData();
    } finally {
      setClosingAll(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment-dark flex items-center justify-center">
        <p className="font-sans text-ink/40 text-sm">Loading…</p>
      </main>
    );
  }

  const tables = data?.tables ?? [];
  const orders = data?.orders ?? [];
  const openCount = tables.length;

  return (
    <div className="min-h-screen bg-parchment-dark">
      {/* Header */}
      <header className="bg-ochre px-5 py-4">
        {/* Top row: title + icon actions */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="font-sans text-ink text-[15px] tracking-widest uppercase">
              Staff Dashboard
            </p>
            <h1 className="font-serif font-light text-ink text-xl leading-tight">
              The Marsh Harrier
            </h1>
          </div>
          {/* Icon-style actions — always fit on one line */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href="/admin/menu"
              title="Manage menu"
              aria-label="Manage menu — edit names, prices, descriptions and availability"
              className="w-10 h-10 flex items-center justify-center text-ink/50 hover:text-ink transition-colors text-base"
            >
              ☰
            </a>
            <a
              href="/admin/rooms"
              title="Room bookings"
              aria-label="Room bookings — mark nights as booked and set prices"
              className="w-10 h-10 flex items-center justify-center text-ink/50 hover:text-ink transition-colors text-base"
            >
              ⌂
            </a>
            <a
              href="/admin/hours"
              title="Opening hours"
              aria-label="Opening hours — edit the weekly schedule"
              className="w-10 h-10 flex items-center justify-center text-ink/50 hover:text-ink transition-colors text-base"
            >
              🕗
            </a>
            <a
              href="/admin/qr"
              title="QR Codes"
              aria-label="QR code generator"
              className="w-10 h-10 flex items-center justify-center text-ink/50 hover:text-ink transition-colors text-base"
            >
              ▦
            </a>
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="w-10 h-10 flex items-center justify-center text-ink/30 hover:text-ink/60 transition-colors text-sm"
            >
              ⏻
            </button>
          </div>
        </div>
        {/* Status row + Close All on same line */}
        <div className="flex items-center justify-between gap-4">
          <p className="font-sans text-ink/40 text-xs">
            {openCount} table{openCount !== 1 ? "s" : ""} open
            {lastUpdated && (
              <span className="ml-2">
                · {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            {offline && (
              <span className="ml-2 text-red-300/60">· Connection lost</span>
            )}
          </p>
          {openCount > 0 && (
            <button
              onClick={closeAll}
              disabled={closingAll}
              className="font-sans text-[15px] tracking-widest uppercase px-3 py-1.5 border border-red-400/40 text-red-300/80 hover:bg-red-900/20 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {closingAll ? "Closing…" : "Close All"}
            </button>
          )}
        </div>
      </header>

      {/* Service controls */}
      <section
        aria-label="Service controls"
        className="bg-parchment-light border-b border-forest-deep/10 px-4 md:px-6 py-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div>
              <p className="font-sans text-[11px] tracking-widest uppercase text-ink/50 mb-1">
                Online ordering
              </p>
              <p className="font-sans text-sm text-forest-deep">
                {settings.ordersPaused
                  ? "Paused — customers cannot place orders"
                  : "Accepting orders"}
              </p>
            </div>
            <button
              onClick={() =>
                updateSettings({ ordersPaused: !settings.ordersPaused }, "pause")
              }
              disabled={savingSetting !== null}
              className={`font-sans text-[15px] tracking-widest uppercase px-4 py-2 transition-colors disabled:opacity-50 ${
                settings.ordersPaused
                  ? "bg-ochre text-parchment-light hover:bg-ochre-light"
                  : "border border-red-400/50 text-red-700 hover:bg-red-50"
              }`}
            >
              {savingSetting === "pause"
                ? "…"
                : settings.ordersPaused
                ? "Resume"
                : "Pause"}
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="md:text-right">
              <p className="font-sans text-[11px] tracking-widest uppercase text-ink/50 mb-1">
                Drink wait time
              </p>
              <p className="font-sans text-sm text-forest-deep">
                {settings.drinkDelayMinutes > 0
                  ? `Shown to customers as ~${settings.drinkDelayMinutes} min`
                  : "No notice shown"}
              </p>
            </div>
            <div className="relative">
              <select
                aria-label="Drink wait time in minutes"
                value={settings.drinkDelayMinutes}
                disabled={savingSetting !== null}
                onChange={(e) =>
                  updateSettings(
                    { drinkDelayMinutes: Number(e.target.value) },
                    "delay"
                  )
                }
                className="appearance-none bg-parchment border border-forest-deep/20 text-forest-deep font-sans text-sm px-4 py-2 pr-9 focus:outline-none focus:border-ochre/60 transition-colors disabled:opacity-50"
              >
                {DRINK_DELAY_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m === 0 ? "No delay" : `${m} min`}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 text-xs"
                aria-hidden="true"
              >
                ▾
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-forest-deep/5 flex items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-ink/40 font-light">
            First-time setup or after a deploy: run database setup so new features work.
          </p>
          <button
            onClick={runInit}
            disabled={initState === "running"}
            className="font-sans text-[11px] tracking-widest uppercase px-3 py-1.5 border border-forest-deep/20 text-ink/60 hover:border-forest-deep/40 hover:text-forest-deep disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {initState === "running"
              ? "Setting up…"
              : initState === "done"
              ? "✓ Setup complete"
              : initState === "error"
              ? "Setup failed — retry"
              : "Run database setup"}
          </button>
        </div>
      </section>

      {/* Content */}
      <main className="p-4 md:p-6">
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full border border-forest-deep/20 flex items-center justify-center mb-6">
              <span className="font-serif italic text-forest-deep/30 text-2xl">—</span>
            </div>
            <p className="font-serif text-forest-deep/40 text-xl mb-2">
              No tables open
            </p>
            <p className="font-sans text-ink/30 text-sm font-light">
              Orders will appear here as customers place them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tables.map((table) => {
              const mins = minutesOpen(table.opened_at);
              const level = staleLevel(mins);
              const tableOrders = orders.filter(
                (o) => o.table_number === table.table_number
              );

              return (
                <article
                  key={table.table_number}
                  className={`bg-parchment-light ${
                    level === "red"
                      ? "ring-2 ring-red-500"
                      : level === "amber"
                      ? "ring-2 ring-amber-500"
                      : ""
                  }`}
                >
                  {/* Table header */}
                  <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-forest-deep/8">
                    <div>
                      <p className="font-serif font-light text-forest-deep text-3xl leading-none">
                        {table.table_number === 0 ? "Takeaway" : table.table_number}
                      </p>
                      <p
                        className={`font-sans text-xs mt-1 ${
                          level === "red"
                            ? "text-red-600"
                            : level === "amber"
                            ? "text-amber-600"
                            : "text-ink/40"
                        }`}
                      >
                        Open {formatDuration(mins)}
                        {level !== "ok" && (
                          <span className="ml-1">
                            {level === "red" ? "⚠ Long time open" : "· Getting long"}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => closeTable(table.table_number)}
                      disabled={closingTable === table.table_number}
                      className="font-sans text-[15px] tracking-widest uppercase px-3 py-1.5 border border-forest-deep/20 text-forest-deep/60 hover:border-forest-deep/40 hover:text-forest-deep disabled:opacity-50 transition-colors"
                    >
                      {closingTable === table.table_number ? "…" : "Close table"}
                    </button>
                  </div>

                  {/* Orders — laid out left-to-right, wrapping to new rows */}
                  <div className="flex flex-wrap items-start gap-3 p-3">
                    {tableOrders.length === 0 ? (
                      <p className="font-sans text-ink/30 text-xs px-1 py-1">
                        No pending orders
                      </p>
                    ) : (
                      tableOrders.map((order) => {
                        const grossSubtotal = order.items.reduce(
                          (s, i) => s + itemLineTotal(i),
                          0
                        );
                        const discountPct = Number(order.discount_percent ?? 0);
                        const discountAmount = Math.round((grossSubtotal * discountPct) / 100);
                        const orderSubtotal = grossSubtotal - discountAmount;
                        const orderServiceCharge = Math.round(orderSubtotal * 0.1);
                        const orderTotal = orderSubtotal + orderServiceCharge;
                        const pickerOpen = discountPickerFor === order.id;
                        return (
                          <div
                            key={order.id}
                            className="w-full sm:w-[320px] flex-shrink-0 border border-forest-deep/10 px-4 py-3"
                          >
                            {order.customer_name && (
                              <div className="mb-2">
                                <p className="font-sans text-sm font-medium text-forest-deep">{order.customer_name}</p>
                                <a href={`tel:${order.customer_phone}`} className="font-sans text-xs text-ink/60 hover:underline">
                                  {order.customer_phone}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-sans text-[15px] tracking-widest uppercase text-ink/60">
                                Order #{order.id} · {formatTime(order.created_at)}
                              </p>
                              <div className="text-right">
                                {discountPct > 0 ? (
                                  <>
                                    <p className="font-sans text-[11px] text-ink/40 tabular-nums line-through">
                                      {formatPrice(grossSubtotal)}
                                    </p>
                                    <p className="font-sans text-[11px] text-ochre tabular-nums">
                                      −{formatPrice(discountAmount)} ({discountPct}%)
                                    </p>
                                    <p className="font-sans text-xs text-ink/50 tabular-nums">{formatPrice(orderSubtotal)}</p>
                                  </>
                                ) : (
                                  <p className="font-sans text-xs text-ink/50 tabular-nums">{formatPrice(orderSubtotal)}</p>
                                )}
                                <p className="font-sans text-[11px] text-ink/35 tabular-nums">+{formatPrice(orderServiceCharge)} service</p>
                                <p className="font-sans text-xs font-medium text-forest-deep tabular-nums">{formatPrice(orderTotal)}</p>
                              </div>
                            </div>
                            <ul className="space-y-1.5 mb-3">
                              {(() => {
                                const parentIds = new Set(order.items.map((it) => it.id));
                                const isTopLevel = (it: OrderItem) =>
                                  it.parentId === undefined || !parentIds.has(it.parentId);
                                return order.items.filter(isTopLevel).map((item, i) => {
                                  const children = order.items.filter(
                                    (c) => c.parentId === item.id
                                  );
                                  return (
                                    <li key={i} className="font-sans text-forest-deep">
                                      <p className="text-sm">
                                        <span className="font-medium">
                                          {item.quantity}×
                                        </span>{" "}
                                        {item.name}
                                      </p>
                                      {children.length > 0 && (
                                        <ul className="mt-0.5 ml-4 space-y-0.5">
                                          {children.map((c, ci) => (
                                            <li
                                              key={ci}
                                              className="font-sans text-xs text-ink/55 font-light"
                                            >
                                              + {c.quantity}× {c.name}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </li>
                                  );
                                });
                              })()}
                            </ul>
                            <div className="mb-2">
                              {discountPct > 0 ? (
                                <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-ochre/10 border border-ochre/30">
                                  <p className="font-sans text-[11px] text-ink/70">
                                    {discountPct}% discount
                                    {order.discount_reason && (
                                      <span className="text-ink/45"> · {order.discount_reason}</span>
                                    )}
                                  </p>
                                  <button
                                    onClick={() => applyDiscount(order.id, 0, null)}
                                    disabled={discountingOrder === order.id}
                                    className="font-sans text-[10px] tracking-widest uppercase text-ink/55 hover:text-ink disabled:opacity-50 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : pickerOpen ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {DISCOUNT_PRESETS.map((p) => (
                                    <button
                                      key={p.label}
                                      onClick={() => applyDiscount(order.id, p.percent, p.reason)}
                                      disabled={discountingOrder === order.id}
                                      className="font-sans text-[10px] tracking-widest uppercase px-2.5 py-1.5 border border-forest-deep/20 text-forest-deep hover:bg-forest-deep/5 disabled:opacity-50 transition-colors"
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => promptCustomDiscount(order.id)}
                                    disabled={discountingOrder === order.id}
                                    className="font-sans text-[10px] tracking-widest uppercase px-2.5 py-1.5 border border-forest-deep/20 text-forest-deep hover:bg-forest-deep/5 disabled:opacity-50 transition-colors"
                                  >
                                    Custom
                                  </button>
                                  <button
                                    onClick={() => setDiscountPickerFor(null)}
                                    className="font-sans text-[10px] tracking-widest uppercase px-2.5 py-1.5 text-ink/45 hover:text-ink transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDiscountPickerFor(order.id)}
                                  className="font-sans text-[10px] tracking-widest uppercase text-ink/50 hover:text-forest-deep transition-colors"
                                >
                                  + Apply discount
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => markDelivered(order.id)}
                              disabled={deliveringOrder === order.id}
                              className="w-full font-sans text-xs tracking-widest uppercase px-4 py-3 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-50 transition-colors"
                            >
                              {deliveringOrder === order.id
                                ? "Marking…"
                                : "Mark Delivered"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
