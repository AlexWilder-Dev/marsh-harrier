"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";

type MenuItem = {
  id: number;
  category: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
};

type CartItem = MenuItem & { quantity: number };
type Cart = Record<number, CartItem>;

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function cartTotal(cart: Cart) {
  return Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

function cartCount(cart: Cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function OrderPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const isTakeaway = searchParams.get("type") === "takeaway";
  const tableNumber = tableParam ? parseInt(tableParam, 10) : (isTakeaway ? 0 : null);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [menuRetry, setMenuRetry] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const cartSheetRef = useRef<HTMLDivElement>(null);

  useFocusTrap(cartSheetRef, cartOpen, () => setCartOpen(false));

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => {
        if (!r.ok) throw new Error("Menu unavailable");
        return r.json();
      })
      .then((data: MenuItem[]) => {
        const available = data.filter((item) => item.available);
        setMenu(available);
        const cats = Array.from(new Set(available.map((i) => i.category)));
        setCategories(cats);
        setActiveCategory(cats[0] ?? "");
      })
      .catch(() => setMenuError(true))
      .finally(() => setLoading(false));
  }, [menuRetry]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : { ...item, quantity: 1 },
      };
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...existing, quantity: existing.quantity - 1 } };
    });
  }, []);

  const submitOrder = async () => {
    if (tableNumber === null || isNaN(tableNumber) || cartCount(cart) === 0) return;
    if (isTakeaway && (!customerName.trim() || !customerPhone.trim())) {
      setError("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const items = Object.values(cart).map(({ id, name, quantity, price }) => ({
      id,
      name,
      quantity,
      price,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: tableNumber,
          items,
          ...(isTakeaway && { customerName: customerName.trim(), customerPhone: customerPhone.trim() }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setCart({});
      setCartOpen(false);
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Invalid table number (takeaway uses table 0 and bypasses this check)
  if (!isTakeaway && (!tableNumber || isNaN(tableNumber) || tableNumber < 1)) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <p className="font-serif text-forest-deep text-2xl mb-3">
            No table found.
          </p>
          <p className="font-sans text-ink/60 text-sm font-light">
            Please scan the QR code on your table to order.
          </p>
        </div>
      </main>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <main className="min-h-screen bg-forest-deep flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full border border-ochre/60 flex items-center justify-center mx-auto mb-8">
            <span className="font-serif italic text-ochre text-2xl">✓</span>
          </div>
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-4">
            Order placed
          </p>
          <h1 className="font-serif font-light text-parchment-light text-3xl mb-4">
            {isTakeaway
              ? "Order received."
              : `We\u2019ll bring it over to Table\u00a0${tableNumber}.`}
          </h1>
          <p className="font-sans text-parchment-light/50 text-sm font-light leading-relaxed mb-10">
            {isTakeaway
              ? "Please call us on 01865 718225 to confirm your order and arrange payment."
              : "Payment is by card when your order arrives. Please enjoy your visit."}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="font-sans text-xs tracking-widest uppercase px-8 py-4 border border-parchment-light/30 text-parchment-light hover:bg-parchment-light/10 transition-colors"
          >
            Order More
          </button>
        </div>
      </main>
    );
  }

  const count = cartCount(cart);
  const subtotal = cartTotal(cart);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + serviceCharge;
  const visibleItems = menu.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-forest-deep px-5 h-[72px] flex items-center justify-between">
        <div>
          <p className="font-sans text-ochre text-[15px] tracking-widest uppercase">
            The Marsh Harrier
          </p>
          <h1 className="font-serif font-light text-parchment-light text-lg leading-tight">
            {isTakeaway ? "Takeaway Order" : `Table ${tableNumber}`}
          </h1>
        </div>
        {count > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase px-4 py-2.5 bg-ochre text-parchment-light"
            aria-label={`View cart — ${count} item${count !== 1 ? "s" : ""}`}
          >
            <span>{count}</span>
            <span className="hidden sm:inline">item{count !== 1 ? "s" : ""}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </header>

      {/* Category tabs */}
      <nav
        aria-label="Menu categories"
        className="sticky top-[72px] z-20 bg-parchment-dark overflow-x-auto"
      >
        <div className="flex min-w-max px-4 gap-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? "border-ochre text-forest-deep font-medium"
                  : "border-transparent text-ink/45 hover:text-ink/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu items */}
      <main className="px-4 py-6 pb-44">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-forest-deep/5 animate-pulse rounded"
              />
            ))}
          </div>
        ) : menuError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="font-serif text-forest-deep text-xl mb-2">
              Couldn&apos;t load the menu.
            </p>
            <p className="font-sans text-ink/50 text-sm font-light mb-6">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => { setMenuError(false); setLoading(true); setMenuRetry(n => n + 1); }}
              className="font-sans text-xs tracking-widest uppercase px-6 py-3 bg-forest-deep text-parchment-light"
            >
              Retry
            </button>
          </div>
        ) : (
          <ul className="space-y-px" role="list">
            {visibleItems.map((item) => {
              const qty = cart[item.id]?.quantity ?? 0;
              return (
                <li
                  key={item.id}
                  className="bg-parchment-light flex items-start gap-4 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-forest-deep font-medium text-sm">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="font-sans text-ink/50 text-xs font-light mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <p className="font-sans text-ochre text-sm font-medium mt-1.5">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    {qty > 0 ? (
                      <>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove one ${item.name}`}
                          className="w-10 h-10 flex items-center justify-center border border-forest-deep/20 text-forest-deep font-medium text-lg leading-none hover:bg-forest-deep/5 transition-colors"
                        >
                          −
                        </button>
                        <span className="font-sans text-forest-deep font-medium text-sm w-4 text-center tabular-nums">
                          {qty}
                        </span>
                      </>
                    ) : (
                      <span className="w-[64px]" aria-hidden="true" />
                    )}
                    <button
                      onClick={() => addToCart(item)}
                      aria-label={`Add ${item.name} to order`}
                      className="w-10 h-10 flex items-center justify-center bg-forest-deep text-parchment-light font-medium text-lg leading-none hover:bg-forest-rich transition-colors"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Sticky cart bar */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-4 pb-safe-4 bg-parchment border-t border-forest-deep/10">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between font-sans text-xs tracking-widest uppercase px-6 py-4 bg-forest-deep text-parchment-light hover:bg-forest-rich transition-colors"
          >
            <span>
              {count} item{count !== 1 ? "s" : ""}
            </span>
            <span>Review Order</span>
            <span className="font-medium">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      {cartOpen && (
        <div
          ref={cartSheetRef}
          className="fixed inset-0 z-40 flex flex-col justify-end"
          role="dialog"
          aria-label="Your order"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-forest-deep/60"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative bg-parchment max-h-[85vh] flex flex-col">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-forest-deep/10">
              <h2 className="font-serif font-light text-forest-deep text-xl">
                {isTakeaway ? "Your Takeaway Order" : `Your Order — Table ${tableNumber}`}
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="w-10 h-10 flex items-center justify-center text-ink/40 hover:text-ink transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Items list */}
            <ul className="overflow-y-auto flex-1 divide-y divide-forest-deep/5">
              {Object.values(cart).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-forest-deep font-medium text-sm">
                      {item.name}
                    </p>
                    <p className="font-sans text-ink/50 text-xs">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove one ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center border border-forest-deep/20 text-forest-deep text-lg hover:bg-forest-deep/5 transition-colors"
                    >
                      −
                    </button>
                    <span className="font-sans text-forest-deep font-medium w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      aria-label={`Add one more ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center bg-forest-deep text-parchment-light text-lg hover:bg-forest-rich transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-sans text-ochre font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Total + submit */}
            <div className="px-5 pt-4 border-t border-forest-deep/10 bg-parchment" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-sans text-xs tracking-widest uppercase text-ink/40">
                  Subtotal
                </p>
                <p className="font-sans text-forest-deep text-sm tabular-nums">{formatPrice(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-xs tracking-widest uppercase text-ink/40">
                  Service charge (10%)
                </p>
                <p className="font-sans text-forest-deep text-sm tabular-nums">{formatPrice(serviceCharge)}</p>
              </div>
              <div className="flex items-center justify-between border-t border-forest-deep/10 pt-4 mb-4">
                <p className="font-sans text-xs tracking-widest uppercase text-ink/50">
                  Total
                </p>
                <p className="font-serif text-forest-deep text-2xl tabular-nums">
                  {formatPrice(total)}
                </p>
              </div>
              <p className="font-sans text-ink/40 text-xs leading-relaxed mb-5">
                A service charge of 10% has been added to your bill.
              </p>

              {isTakeaway && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label htmlFor="customer-name" className="block font-sans text-[15px] tracking-widest uppercase text-ink/40 mb-1.5">
                      Name <span aria-label="required">*</span>
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-parchment-dark border border-forest-deep/20 text-forest-deep font-sans text-sm px-3 py-2.5 placeholder-ink/25 focus:outline-none focus:border-ochre/60 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="block font-sans text-[15px] tracking-widest uppercase text-ink/40 mb-1.5">
                      Phone <span aria-label="required">*</span>
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-parchment-dark border border-forest-deep/20 text-forest-deep font-sans text-sm px-3 py-2.5 placeholder-ink/25 focus:outline-none focus:border-ochre/60 transition-colors"
                      placeholder="07700 900000"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="font-sans text-sm text-red-600 mb-4 leading-relaxed">
                  {error}
                </p>
              )}

              <button
                onClick={submitOrder}
                disabled={submitting}
                className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-60 transition-colors"
              >
                {submitting ? "Placing order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-parchment flex items-center justify-center">
          <p className="font-sans text-ink/40 text-sm">Loading menu…</p>
        </div>
      }
    >
      <OrderPage />
    </Suspense>
  );
}
