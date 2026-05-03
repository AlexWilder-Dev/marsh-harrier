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
type Pairing = { spiritId: number; mixerId: number };
type DisplayGroup =
  | { kind: "single"; item: CartItem }
  | { kind: "paired"; spirit: CartItem; mixers: CartItem[] };

const MIXER_PROMPT_CATEGORIES = ["Gin", "Vodka", "Rum", "Whisky", "Bourbon", "Liqueurs"];

// Two-level navigation — groups map display labels to underlying menu categories
const DRINK_GROUPS = [
  { label: "Beers & Ciders", categories: ["Draught", "Bottles"] },
  { label: "Wine",           categories: ["White Wine", "Red Wine", "Rosé & Sparkling"] },
  { label: "Spirits",        categories: ["Gin", "Vodka", "Rum", "Whisky", "Bourbon", "Liqueurs"] },
  { label: "Cocktails",      categories: ["Cocktails", "Mocktails"] },
  { label: "Shots",          categories: ["Shots"] },
  { label: "Soft Drinks",    categories: ["Soft Drinks", "Juices"] },
];

const FOOD_GROUPS = [
  { label: "Starters",       categories: ["Starters"] },
  { label: "Mains",          categories: ["Mains", "Burgers", "Pizza"] },
  { label: "Sunday Roast",   categories: ["Sunday Roast"] },
  { label: "Sides & Salads", categories: ["Sides", "Salads"] },
  { label: "Vegan",          categories: ["Vegan"] },
  { label: "Children's",     categories: ["Children's"] },
  { label: "Puddings",       categories: ["Puddings"] },
];

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function cartTotal(cart: Cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartCount(cart: Cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function ItemControls({
  item,
  onRemove,
  onAdd,
}: {
  item: CartItem;
  onRemove: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={onRemove}
        aria-label={`Remove one ${item.name}`}
        className="w-9 h-9 flex items-center justify-center border border-forest-deep/20 text-forest-deep text-lg hover:bg-forest-deep/5 transition-colors"
      >
        −
      </button>
      <span className="font-sans text-forest-deep font-medium w-4 text-center tabular-nums">
        {item.quantity}
      </span>
      <button
        onClick={onAdd}
        aria-label={`Add one more ${item.name}`}
        className="w-9 h-9 flex items-center justify-center bg-ochre text-parchment-light text-lg hover:bg-ochre-light transition-colors"
      >
        +
      </button>
    </div>
  );
}

function OrderPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const isTakeaway = searchParams.get("type") === "takeaway";
  const tableNumber = tableParam ? parseInt(tableParam, 10) : (isTakeaway ? 0 : null);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeSection, setActiveSection] = useState<"food" | "drink">("drink");
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [cart, setCart] = useState<Cart>({});
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mixerPromptFor, setMixerPromptFor] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [menuRetry, setMenuRetry] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const cartSheetRef = useRef<HTMLDivElement>(null);
  const mixerSheetRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  useFocusTrap(cartSheetRef, cartOpen, () => setCartOpen(false));
  useFocusTrap(mixerSheetRef, mixerPromptFor !== null, () => setMixerPromptFor(null));

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => {
        if (!r.ok) throw new Error("Menu unavailable");
        return r.json();
      })
      .then((data: MenuItem[]) => {
        const available = data.filter((item) => item.available);
        setMenu(available);
        const firstGroup = DRINK_GROUPS.find(g =>
          g.categories.some(c => available.some(i => i.category === c))
        );
        setActiveGroup(firstGroup?.label ?? "");
      })
      .catch(() => setMenuError(true))
      .finally(() => setLoading(false));
  }, [menuRetry]);

  const handleSectionChange = (section: "food" | "drink") => {
    setActiveSection(section);
    const groups = section === "drink" ? DRINK_GROUPS : FOOD_GROUPS;
    const firstGroup = groups.find(g =>
      g.categories.some(c => menu.some(i => i.category === c))
    );
    setActiveGroup(firstGroup?.label ?? "");
  };

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

  const handleMenuAdd = useCallback(
    (item: MenuItem) => {
      addToCart(item);
      if (MIXER_PROMPT_CATEGORIES.includes(item.category)) {
        setMixerPromptFor(item);
      }
    },
    [addToCart]
  );

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

  const removeLastPairingFor = useCallback(
    (field: "spiritId" | "mixerId", id: number, qty: number) => {
      setPairings((prev) => {
        if (qty <= 1) return prev.filter((p) => p[field] !== id);
        const idx = prev.map((p) => p[field]).lastIndexOf(id);
        if (idx === -1) return prev;
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
    },
    []
  );

  const submitOrder = async () => {
    if (submittingRef.current) return;
    if (tableNumber === null || isNaN(tableNumber) || cartCount(cart) === 0) return;
    if (isTakeaway && (!customerName.trim() || !customerPhone.trim())) {
      setError("Please enter your name and phone number.");
      return;
    }
    submittingRef.current = true;
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
      setPairings([]);
      setCartOpen(false);
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!isTakeaway && (!tableNumber || isNaN(tableNumber) || tableNumber < 1)) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <p className="font-serif text-forest-deep text-2xl mb-3">No table found.</p>
          <p className="font-sans text-ink/60 text-sm font-light">
            Please scan the QR code on your table to order.
          </p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-ochre flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full border border-ochre/60 flex items-center justify-center mx-auto mb-8">
            <span className="font-serif italic text-ink text-2xl">✓</span>
          </div>
          <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4">Order placed</p>
          <h1 className="font-serif font-light text-ink text-3xl mb-4">
            {isTakeaway
              ? "Order received."
              : `We'll bring it over to Table ${tableNumber}.`}
          </h1>
          <p className="font-sans text-ink/60 text-sm font-light leading-relaxed mb-10">
            {isTakeaway
              ? "Please call us on 01865 718225 to confirm your order and arrange payment."
              : "Payment is by card when your order arrives. Please enjoy your visit."}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="font-sans text-xs tracking-widest uppercase px-8 py-4 border border-ink/30 text-ink hover:bg-ink/10 transition-colors"
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

  // Navigation state
  const allGroups = activeSection === "drink" ? DRINK_GROUPS : FOOD_GROUPS;
  const availableGroups = allGroups.filter(g =>
    g.categories.some(c => menu.some(i => i.category === c))
  );
  const currentGroupDef = availableGroups.find(g => g.label === activeGroup);
  const showSubHeaders = (currentGroupDef?.categories.length ?? 0) > 1;
  const visibleItems = currentGroupDef
    ? menu.filter(i => currentGroupDef.categories.includes(i.category))
    : [];

  // Mixers for prompt sheet
  const mixers = menu.filter((i) => i.category === "Mixers");
  const nl = (m: MenuItem) => m.name.toLowerCase();
  const mixerGroups = [
    { label: "Tonic",       items: mixers.filter((m) => nl(m).includes("tonic")) },
    { label: "Ginger",      items: mixers.filter((m) => nl(m).includes("ginger")) },
    { label: "Red Bull",    items: mixers.filter((m) => nl(m).includes("red bull")) },
    { label: "Juices",      items: mixers.filter((m) => nl(m).includes("juice")) },
    { label: "Soft Drinks", items: mixers.filter((m) => ["pepsi", "lemonade", "soda"].some((k) => nl(m).includes(k))) },
    { label: "Bottles",     items: mixers.filter((m) => nl(m).includes("bottle")) },
  ];

  // Cart display groups
  const pairedMixerIds = new Set(pairings.map((p) => p.mixerId));
  const spiritToMixers = new Map<number, number[]>();
  for (const p of pairings) {
    if (!spiritToMixers.has(p.spiritId)) spiritToMixers.set(p.spiritId, []);
    spiritToMixers.get(p.spiritId)!.push(p.mixerId);
  }
  const displayGroups = Object.values(cart).reduce<DisplayGroup[]>((acc, item) => {
    if (pairedMixerIds.has(item.id)) return acc;
    const mixerIds = spiritToMixers.get(item.id);
    if (mixerIds && mixerIds.length > 0) {
      const uniqueIds = [...new Set(mixerIds)];
      const mixerItems = uniqueIds.map((id) => cart[id]).filter(Boolean) as CartItem[];
      acc.push({ kind: "paired", spirit: item, mixers: mixerItems });
    } else {
      acc.push({ kind: "single", item });
    }
    return acc;
  }, []);

  // Inline item renderer — reused for flat lists and sub-headed lists
  const renderMenuItem = (item: MenuItem) => {
    const qty = cart[item.id]?.quantity ?? 0;
    return (
      <li key={item.id} className="bg-parchment-light flex items-start gap-4 p-4">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-forest-deep font-medium text-sm">{item.name}</p>
          {item.description && (
            <p className="font-sans text-ink/50 text-xs font-light mt-0.5 leading-relaxed">
              {item.description}
            </p>
          )}
          <p className="font-sans text-ink text-sm font-medium mt-1.5">{formatPrice(item.price)}</p>
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
            onClick={() => handleMenuAdd(item)}
            aria-label={`Add ${item.name} to order`}
            className="w-10 h-10 flex items-center justify-center bg-ochre text-parchment-light font-medium text-lg leading-none hover:bg-ochre-light transition-colors"
          >
            +
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-parchment">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-ochre px-5 h-[72px] flex items-center justify-between">
        <div>
          <p className="font-sans text-ink text-[15px] tracking-widest uppercase">
            The Marsh Harrier
          </p>
          <h1 className="font-serif font-light text-ink text-lg leading-tight">
            {isTakeaway ? "Takeaway Order" : `Table ${tableNumber}`}
          </h1>
        </div>
        {count > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase px-4 py-2.5 bg-parchment text-ink hover:bg-parchment-dark transition-colors"
            aria-label={`View cart — ${count} item${count !== 1 ? "s" : ""}`}
          >
            <span>{count}</span>
            <span className="hidden sm:inline">item{count !== 1 ? "s" : ""}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </header>

      {/* Food / Drink toggle — sticky below header */}
      <div className="sticky top-[72px] z-20 grid grid-cols-2 border-b border-forest-deep/15">
        {(["drink", "food"] as const).map((section) => (
          <button
            key={section}
            onClick={() => handleSectionChange(section)}
            className={`py-3.5 font-sans text-xs tracking-widest uppercase transition-colors ${
              activeSection === section
                ? "bg-forest-deep text-parchment-light"
                : "bg-parchment-dark text-ink/50 hover:text-ink hover:bg-parchment"
            }`}
          >
            {section === "drink" ? "Drink" : "Food"}
          </button>
        ))}
      </div>

      {/* Category tabs — sticky below toggle */}
      <nav
        aria-label="Menu categories"
        className="sticky top-[124px] z-20 bg-parchment-dark overflow-x-auto border-b border-forest-deep/10"
      >
        <div className="flex min-w-max px-4 gap-0">
          {availableGroups.map((g) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(g.label)}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeGroup === g.label
                  ? "border-ochre text-forest-deep font-medium"
                  : "border-transparent text-ink/45 hover:text-ink/70"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu items */}
      <main className="pb-44">
        {loading ? (
          <div className="space-y-px px-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-ink/5 animate-pulse" />
            ))}
          </div>
        ) : menuError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="font-serif text-forest-deep text-xl mb-2">Couldn&apos;t load the menu.</p>
            <p className="font-sans text-ink/50 text-sm font-light mb-6">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => { setMenuError(false); setLoading(true); setMenuRetry((r) => r + 1); }}
              className="font-sans text-xs tracking-widest uppercase px-6 py-3 bg-ochre text-parchment-light"
            >
              Retry
            </button>
          </div>
        ) : showSubHeaders ? (
          // Multi-category group: render with sticky section headers
          <div>
            {currentGroupDef!.categories.map((cat) => {
              const catItems = menu.filter((i) => i.category === cat);
              if (!catItems.length) return null;
              return (
                <div key={cat}>
                  <div className="sticky top-[176px] z-10 -mx-0 px-4 py-2.5 bg-parchment-dark border-b border-forest-deep/10">
                    <p className="font-sans text-[11px] tracking-widest uppercase text-ink/50">{cat}</p>
                  </div>
                  <ul className="space-y-px" role="list">
                    {catItems.map(renderMenuItem)}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          // Single-category group: flat list
          <ul className="space-y-px pt-px" role="list">
            {visibleItems.map(renderMenuItem)}
          </ul>
        )}
      </main>

      {/* Sticky cart bar */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-4 pb-safe-4 bg-parchment border-t border-forest-deep/10">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light transition-colors"
          >
            <span>{count} item{count !== 1 ? "s" : ""}</span>
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
          <div className="absolute inset-0 bg-ink/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-parchment max-h-[85vh] flex flex-col">
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

            <ul className="overflow-y-auto flex-1 divide-y divide-forest-deep/5">
              {displayGroups.map((group) => {
                if (group.kind === "single") {
                  return (
                    <li key={group.item.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-forest-deep font-medium text-sm">{group.item.name}</p>
                        <p className="font-sans text-ink/50 text-xs">{formatPrice(group.item.price)} each</p>
                      </div>
                      <ItemControls
                        item={group.item}
                        onRemove={() => removeFromCart(group.item.id)}
                        onAdd={() => addToCart(group.item)}
                      />
                      <p className="font-sans text-ink font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                        {formatPrice(group.item.price * group.item.quantity)}
                      </p>
                    </li>
                  );
                }

                const { spirit, mixers: pairedMixers } = group;
                return (
                  <li key={spirit.id} className="px-5 py-3">
                    <div className="border border-forest-deep/10">
                      <div className="flex items-center gap-4 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-forest-deep font-medium text-sm">{spirit.name}</p>
                          <p className="font-sans text-ink/50 text-xs">{formatPrice(spirit.price)} each</p>
                        </div>
                        <ItemControls
                          item={spirit}
                          onRemove={() => {
                            removeFromCart(spirit.id);
                            removeLastPairingFor("spiritId", spirit.id, spirit.quantity);
                          }}
                          onAdd={() => addToCart(spirit)}
                        />
                        <p className="font-sans text-ink font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                          {formatPrice(spirit.price * spirit.quantity)}
                        </p>
                      </div>
                      {pairedMixers.map((mixer) => (
                        <div
                          key={mixer.id}
                          className="flex items-center gap-4 px-4 py-3 bg-parchment-dark/60 border-t border-forest-deep/5"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-ink/70 text-xs font-medium">+ {mixer.name}</p>
                            <p className="font-sans text-ink/40 text-xs">{formatPrice(mixer.price)} each</p>
                          </div>
                          <ItemControls
                            item={mixer}
                            onRemove={() => {
                              removeFromCart(mixer.id);
                              removeLastPairingFor("mixerId", mixer.id, mixer.quantity);
                            }}
                            onAdd={() => addToCart(mixer)}
                          />
                          <p className="font-sans text-ink/70 font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                            {formatPrice(mixer.price * mixer.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="px-5 pt-4 border-t border-forest-deep/10 bg-parchment" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-sans text-xs tracking-widest uppercase text-ink/40">Subtotal</p>
                <p className="font-sans text-forest-deep text-sm tabular-nums">{formatPrice(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-xs tracking-widest uppercase text-ink/40">Service charge (10%)</p>
                <p className="font-sans text-forest-deep text-sm tabular-nums">{formatPrice(serviceCharge)}</p>
              </div>
              <div className="flex items-center justify-between border-t border-forest-deep/10 pt-4 mb-4">
                <p className="font-sans text-xs tracking-widest uppercase text-ink/50">Total</p>
                <p className="font-serif text-forest-deep text-2xl tabular-nums">{formatPrice(total)}</p>
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
                <p className="font-sans text-sm text-red-600 mb-4 leading-relaxed">{error}</p>
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

      {/* Mixer prompt sheet */}
      {mixerPromptFor && (
        <div
          ref={mixerSheetRef}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-label="Add a mixer"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMixerPromptFor(null)} />
          <div className="relative bg-parchment max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-forest-deep/10">
              <div>
                <h2 className="font-serif font-light text-forest-deep text-xl">Add a mixer?</h2>
                <p className="font-sans text-ink/50 text-xs mt-0.5">
                  You&apos;ve added {mixerPromptFor.name}
                </p>
              </div>
              <button
                onClick={() => setMixerPromptFor(null)}
                aria-label="No mixer, close"
                className="w-10 h-10 flex items-center justify-center text-ink/40 hover:text-ink transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {mixerGroups
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <div key={group.label}>
                    <p className="font-sans text-[10px] tracking-widest uppercase text-ink/40 px-5 pt-4 pb-2">
                      {group.label}
                    </p>
                    <ul className="divide-y divide-forest-deep/5">
                      {group.items.map((mixer) => (
                        <li key={mixer.id} className="flex items-center gap-4 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-forest-deep text-sm">{mixer.name}</p>
                          </div>
                          <p className="font-sans text-ink/60 text-sm tabular-nums flex-shrink-0">
                            {formatPrice(mixer.price)}
                          </p>
                          <button
                            onClick={() => {
                              addToCart(mixer);
                              setPairings((prev) => [
                                ...prev,
                                { spiritId: mixerPromptFor.id, mixerId: mixer.id },
                              ]);
                              setMixerPromptFor(null);
                            }}
                            aria-label={`Add ${mixer.name}`}
                            className="w-9 h-9 flex items-center justify-center bg-ochre text-parchment-light text-lg hover:bg-ochre-light transition-colors flex-shrink-0"
                          >
                            +
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

            <div
              className="px-5 pt-4 border-t border-forest-deep/10 bg-parchment"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={() => setMixerPromptFor(null)}
                className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 border border-forest-deep/20 text-ink/60 hover:text-ink hover:border-forest-deep/40 transition-colors"
              >
                No mixer, thanks
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
