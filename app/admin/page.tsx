"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  table_number: number;
  items: OrderItem[];
  status: string;
  created_at: string;
};

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
  const [closingAll, setClosingAll] = useState(false);

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
    } catch {
      // silent — will retry on next poll
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const markDelivered = async (orderId: number) => {
    setDeliveringOrder(orderId);
    try {
      await fetch(`/api/orders/${orderId}/deliver`, { method: "PUT" });
      await fetchData();
    } finally {
      setDeliveringOrder(null);
    }
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
      <header className="bg-forest-deep px-5 py-4">
        {/* Top row: title + icon actions */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="font-sans text-ochre text-[10px] tracking-widest uppercase">
              Staff Dashboard
            </p>
            <h1 className="font-serif font-light text-parchment-light text-xl leading-tight">
              The Marsh Harrier
            </h1>
          </div>
          {/* Icon-style actions — always fit on one line */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href="/admin/qr"
              title="QR Codes"
              aria-label="QR code generator"
              className="w-10 h-10 flex items-center justify-center text-parchment-light/50 hover:text-parchment-light transition-colors text-base"
            >
              ▦
            </a>
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="w-10 h-10 flex items-center justify-center text-parchment-light/30 hover:text-parchment-light/60 transition-colors text-sm"
            >
              ⏻
            </button>
          </div>
        </div>
        {/* Status row + Close All on same line */}
        <div className="flex items-center justify-between gap-4">
          <p className="font-sans text-parchment-light/30 text-xs">
            {openCount} table{openCount !== 1 ? "s" : ""} open
            {lastUpdated && (
              <span className="ml-2">
                · {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </p>
          {openCount > 0 && (
            <button
              onClick={closeAll}
              disabled={closingAll}
              className="font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 border border-red-400/40 text-red-300/80 hover:bg-red-900/20 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {closingAll ? "Closing…" : "Close All"}
            </button>
          )}
        </div>
      </header>

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tables.map((table) => {
              const mins = minutesOpen(table.opened_at);
              const level = staleLevel(mins);
              const tableOrders = orders.filter(
                (o) => o.table_number === table.table_number
              );

              return (
                <article
                  key={table.table_number}
                  className={`bg-parchment-light flex flex-col ${
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
                        {table.table_number}
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
                      className="font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 border border-forest-deep/20 text-forest-deep/60 hover:border-forest-deep/40 hover:text-forest-deep disabled:opacity-50 transition-colors"
                    >
                      {closingTable === table.table_number ? "…" : "Close table"}
                    </button>
                  </div>

                  {/* Orders */}
                  <div className="flex-1 divide-y divide-forest-deep/5">
                    {tableOrders.length === 0 ? (
                      <p className="font-sans text-ink/30 text-xs px-4 py-4">
                        No pending orders
                      </p>
                    ) : (
                      tableOrders.map((order) => {
                        const orderTotal = order.items.reduce(
                          (s, i) => s + i.price * i.quantity,
                          0
                        );
                        return (
                          <div key={order.id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-sans text-[10px] tracking-widest uppercase text-ochre">
                                Order #{order.id} · {formatTime(order.created_at)}
                              </p>
                              <p className="font-sans text-xs text-ink/50 tabular-nums">
                                {formatPrice(orderTotal)}
                              </p>
                            </div>
                            <ul className="space-y-0.5 mb-3">
                              {order.items.map((item, i) => (
                                <li
                                  key={i}
                                  className="font-sans text-sm text-forest-deep"
                                >
                                  <span className="font-medium">{item.quantity}×</span>{" "}
                                  {item.name}
                                </li>
                              ))}
                            </ul>
                            <button
                              onClick={() => markDelivered(order.id)}
                              disabled={deliveringOrder === order.id}
                              className="w-full font-sans text-xs tracking-widest uppercase px-4 py-3 bg-forest-deep text-parchment-light hover:bg-forest-rich disabled:opacity-50 transition-colors"
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
