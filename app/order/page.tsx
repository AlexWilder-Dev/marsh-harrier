"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  type ServiceWindow,
  currentServiceWindow,
  pickabilityFor,
} from "@/lib/kitchen";
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
  dealOf2Price?: number; // optional "2 for £X" deal price, in pence
};

type CartItem = MenuItem & { quantity: number };
type Cart = Record<number, CartItem>;
type Pairing = { parentId: number; childId: number };
type DisplayGroup =
  | { kind: "single"; item: CartItem }
  | { kind: "paired"; parent: CartItem; children: CartItem[] };

type OptionPromptDef = { legend: string; choices: string[] };

const STEAK_SAUCE_PRICES: Record<string, number> = {
  "Garlic Butter": 250,
  "Peppercorn": 300,
  "No sauce": 0,
};

// Items that require a single one-of choice (added to the name on confirm).
function getOptionPrompt(item: MenuItem): OptionPromptDef | null {
  if (
    item.name === "Aperol Spritz" ||
    item.name === "Campari Spritz" ||
    item.name === "Limoncello Spritz"
  ) {
    return { legend: "Mixer", choices: ["Soda", "Lemonade"] };
  }
  if (item.name === "Mineral Water") {
    return { legend: "Type", choices: ["Still", "Sparkling"] };
  }
  if (item.name === "J2O") {
    return {
      legend: "Flavour",
      choices: ["Apple & Raspberry", "Apple & Mango", "Orange & Passionfruit"],
    };
  }
  if (item.category === "Puddings" && item.name.startsWith("Ice Cream (")) {
    return { legend: "Flavour", choices: ["Vanilla", "Strawberry", "Honeycomb"] };
  }
  if (item.category === "Puddings" && item.name.startsWith("Sorbet (")) {
    return { legend: "Flavour", choices: ["Lemon", "Mango", "Raspberry"] };
  }
  if (item.category === "Shots" && item.name === "Sours") {
    return { legend: "Flavour", choices: ["Apple", "Cherry"] };
  }
  if (item.category === "Shots" && item.name === "Sambuca") {
    return { legend: "Type", choices: ["Black", "White"] };
  }
  if (item.category === "Shots" && item.name === "Tequila") {
    return { legend: "Type", choices: ["Gold", "Blanco"] };
  }
  if (item.name === "Stuffed Aubergine") {
    return { legend: "Style", choices: ["Vegetarian", "Vegan"] };
  }
  return null;
}

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
  { label: "Specials",       categories: ["Specials"] },
  { label: "Starters",       categories: ["Starters"] },
  { label: "Mains",          categories: ["Mains"] },
  { label: "Pizza",          categories: ["Pizza"] },
  { label: "Sunday Roast",   categories: ["Sunday Roast"] },
  { label: "Sides & Salads", categories: ["Sides", "Salads"] },
  { label: "Vegan",          categories: ["Vegan"] },
  { label: "Children's",     categories: ["Children's"] },
  { label: "Puddings",       categories: ["Puddings"] },
];

function isSteakItem(item: MenuItem): boolean {
  return /sirloin|rib[\s-]?eye/i.test(item.name);
}

function isPizzaItem(item: MenuItem): boolean {
  return item.category === "Pizza" || /pizza/i.test(item.name);
}

// Splits "House White (175ml)" → { base: "House White", size: "175ml" }
function parseItemName(name: string): { base: string; size: string | null } {
  const match = name.match(/^(.*)\s+\(([^)]+)\)$/);
  return match ? { base: match[1], size: match[2] } : { base: name, size: null };
}

type ItemGroup = { base: string; description: string; variants: MenuItem[] };

// Groups items by base name so size variants collapse into one card
function groupItems(items: MenuItem[]): ItemGroup[] {
  const map = new Map<string, MenuItem[]>();
  for (const item of items) {
    const { base } = parseItemName(item.name);
    if (!map.has(base)) map.set(base, []);
    map.get(base)!.push(item);
  }
  return Array.from(map.entries()).map(([base, variants]) => ({
    base,
    description: variants[0].description,
    variants,
  }));
}

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

// Applies "2 for £X" deal pricing when present (e.g. Jäger / Skittle / Tiki Bombs).
function lineTotal(item: CartItem): number {
  if (item.dealOf2Price && item.quantity >= 2) {
    const pairs = Math.floor(item.quantity / 2);
    const remainder = item.quantity % 2;
    return pairs * item.dealOf2Price + remainder * item.price;
  }
  return item.price * item.quantity;
}

function cartTotal(cart: Cart) {
  return Object.values(cart).reduce((sum, item) => sum + lineTotal(item), 0);
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
  const [serviceWindow, setServiceWindow] = useState<ServiceWindow>(currentServiceWindow);
  const [activeSection, setActiveSection] = useState<"food" | "drink">("drink");
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [cart, setCart] = useState<Cart>({});
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mixerPromptFor, setMixerPromptFor] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [menuRetry, setMenuRetry] = useState(0);
  const [ordersPaused, setOrdersPaused] = useState(false);
  const [drinkDelayMinutes, setDrinkDelayMinutes] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [pizzaToppingFor, setPizzaToppingFor] = useState<MenuItem | null>(null);
  const [steakPendingItem, setSteakPendingItem] = useState<MenuItem | null>(null);
  const [steakDoneness, setSteakDoneness] = useState("Medium");
  const [steakSauce, setSteakSauce] = useState("Peppercorn");
  const [optionPromptFor, setOptionPromptFor] = useState<
    { item: MenuItem; def: OptionPromptDef } | null
  >(null);
  const cartSheetRef = useRef<HTMLDivElement>(null);
  const mixerSheetRef = useRef<HTMLDivElement>(null);
  const pizzaSheetRef = useRef<HTMLDivElement>(null);
  const steakSheetRef = useRef<HTMLDivElement>(null);
  const optionSheetRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  // Re-evaluate the service window every 30s so the UI flips when the kitchen
  // crosses a boundary (e.g. Sunday 16:00, 17:00 or 20:00) without a refresh.
  useEffect(() => {
    const id = setInterval(() => setServiceWindow(currentServiceWindow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useFocusTrap(cartSheetRef, cartOpen, () => setCartOpen(false));
  useFocusTrap(mixerSheetRef, mixerPromptFor !== null, () => setMixerPromptFor(null));
  useFocusTrap(pizzaSheetRef, pizzaToppingFor !== null, () => setPizzaToppingFor(null));
  useFocusTrap(steakSheetRef, steakPendingItem !== null, () => setSteakPendingItem(null));
  useFocusTrap(optionSheetRef, optionPromptFor !== null, () => setOptionPromptFor(null));

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

  // Poll admin settings so pause/delay updates reach customers within ~30s
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/settings")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled || !data) return;
          setOrdersPaused(Boolean(data.ordersPaused));
          setDrinkDelayMinutes(Number(data.drinkDelayMinutes) || 0);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const handleSectionChange = (section: "food" | "drink") => {
    setActiveSection(section);
    const groups = section === "drink" ? DRINK_GROUPS : FOOD_GROUPS;
    const firstGroup = groups.find(g =>
      g.categories.some(c => menu.some(i => i.category === c))
    );
    setActiveGroup(firstGroup?.label ?? "");
    setExpandedCats(new Set());
  };

  // Collapse all sub-categories when switching groups
  useEffect(() => {
    setExpandedCats(new Set());
  }, [activeGroup]);

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
      // Respect the current kitchen window — defensive in case the UI's disabled
      // state ever gets bypassed (e.g. stale state across a window boundary).
      if (!pickabilityFor(item, serviceWindow).pickable) return;
      // Steak (sirloin or rib eye): show doneness/sauce modal before the first add
      if (isSteakItem(item) && (cart[item.id]?.quantity ?? 0) === 0) {
        setSteakPendingItem(item);
        setSteakDoneness("Medium");
        setSteakSauce("Peppercorn");
        return;
      }
      // Items with a one-of choice (spritz mixer, J2O flavour, ice cream / sorbet flavour, shot type).
      // Same pattern as steak: prompt on first add; subsequent adds inherit the choice
      // (cart lines collapse by item id, so a different flavour means removing and re-adding).
      const promptDef = getOptionPrompt(item);
      if (promptDef && (cart[item.id]?.quantity ?? 0) === 0) {
        setOptionPromptFor({ item, def: promptDef });
        return;
      }
      addToCart(item);
      // Pizza: show topping prompt after adding (includes pizzas in the Specials category)
      if (isPizzaItem(item)) {
        setPizzaToppingFor(item);
        return;
      }
      if (MIXER_PROMPT_CATEGORIES.includes(item.category)) {
        setMixerPromptFor(item);
      }
    },
    [addToCart, cart, serviceWindow]
  );

  const confirmOption = useCallback(
    (choice: string) => {
      if (!optionPromptFor) return;
      const { item } = optionPromptFor;
      addToCart({ ...item, name: `${item.name} — ${choice}` });
      setOptionPromptFor(null);
    },
    [optionPromptFor, addToCart]
  );

  const confirmSteak = useCallback(() => {
    if (!steakPendingItem) return;
    const sauceCost = STEAK_SAUCE_PRICES[steakSauce] ?? 0;
    const suffix = steakSauce === "No sauce" ? steakDoneness : `${steakDoneness}, ${steakSauce}`;
    addToCart({
      ...steakPendingItem,
      name: `${steakPendingItem.name} — ${suffix}`,
      price: steakPendingItem.price + sauceCost,
    });
    setSteakPendingItem(null);
  }, [steakPendingItem, steakDoneness, steakSauce, addToCart]);

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
    (field: "parentId" | "childId", id: number, qty: number) => {
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

    // Per-child parent map — first pairing wins if a child line is attached to multiple parents.
    const childToParent = new Map<number, number>();
    for (const p of pairings) {
      if (!childToParent.has(p.childId)) childToParent.set(p.childId, p.parentId);
    }

    const items = Object.values(cart).map(({ id, name, quantity, price, dealOf2Price }) => {
      const parentId = childToParent.get(id);
      const base = { id, name, quantity, price };
      return {
        ...base,
        ...(parentId ? { parentId } : {}),
        ...(dealOf2Price ? { dealOf2Price } : {}),
      };
    });

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
  const pizzaToppings = menu.filter((i) => i.category === "Pizza Toppings");
  const nl = (m: MenuItem) => m.name.toLowerCase();
  const mixerGroups = [
    { label: "Tonic",       items: mixers.filter((m) => nl(m).includes("tonic")) },
    { label: "Ginger",      items: mixers.filter((m) => nl(m).includes("ginger")) },
    { label: "Red Bull",    items: mixers.filter((m) => nl(m).includes("red bull")) },
    { label: "Juices",      items: mixers.filter((m) => nl(m).includes("juice")) },
    { label: "Soft Drinks", items: mixers.filter((m) => ["pepsi", "lemonade", "soda"].some((k) => nl(m).includes(k))) },
    { label: "Bottles",     items: mixers.filter((m) => nl(m).includes("bottle")) },
  ];

  // Cart display groups — any item with children (mixers, pizza toppings) renders nested
  const pairedChildIds = new Set(pairings.map((p) => p.childId));
  const parentToChildren = new Map<number, number[]>();
  for (const p of pairings) {
    if (!parentToChildren.has(p.parentId)) parentToChildren.set(p.parentId, []);
    parentToChildren.get(p.parentId)!.push(p.childId);
  }
  const displayGroups = Object.values(cart).reduce<DisplayGroup[]>((acc, item) => {
    if (pairedChildIds.has(item.id)) return acc;
    const childIds = parentToChildren.get(item.id);
    if (childIds && childIds.length > 0) {
      const uniqueIds = [...new Set(childIds)];
      const childItems = uniqueIds.map((id) => cart[id]).filter(Boolean) as CartItem[];
      acc.push({ kind: "paired", parent: item, children: childItems });
    } else {
      acc.push({ kind: "single", item });
    }
    return acc;
  }, []);

  // Single item row — used when a drink/food has no size variants
  const renderMenuItem = (item: MenuItem) => {
    const qty = cart[item.id]?.quantity ?? 0;
    const { pickable, reason } = pickabilityFor(item, serviceWindow);
    return (
      <li
        key={item.id}
        className={`bg-parchment-light flex items-start gap-4 p-4 border-l-2 ${
          qty > 0 ? "border-ochre" : "border-transparent"
        } ${pickable ? "" : "opacity-60"}`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-sans text-forest-deep font-medium text-sm">{item.name}</p>
          {item.description && (
            <p className="font-sans text-ink/50 text-xs font-light mt-0.5 leading-relaxed">
              {item.description}
            </p>
          )}
          <p className="font-sans text-ink text-sm font-medium mt-1.5">{formatPrice(item.price)}</p>
          {!pickable && reason && (
            <p className="font-sans text-ochre text-[11px] italic mt-1">{reason}</p>
          )}
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
            disabled={!pickable}
            aria-label={`Add ${item.name} to order`}
            className="w-10 h-10 flex items-center justify-center bg-ochre text-parchment-light font-medium text-lg leading-none hover:bg-ochre-light transition-colors disabled:bg-ink/15 disabled:cursor-not-allowed disabled:hover:bg-ink/15"
          >
            +
          </button>
        </div>
      </li>
    );
  };

  // Multi-size card — groups e.g. "House White (175ml / 250ml / Bottle)" into one row
  const renderVariantCard = (group: ItemGroup) => {
    const anyInCart = group.variants.some(v => (cart[v.id]?.quantity ?? 0) > 0);
    // All variants in a group share a category, so the window restriction is identical for all of them.
    const groupAvailability = pickabilityFor(group.variants[0], serviceWindow);
    return (
    <li key={group.base} className={`bg-parchment-light border-l-2 ${anyInCart ? "border-ochre" : "border-transparent"} ${groupAvailability.pickable ? "" : "opacity-60"}`}>
      <div className="px-4 pt-4 pb-2">
        <p className="font-sans text-forest-deep font-medium text-sm">{group.base}</p>
        {group.description && (
          <p className="font-sans text-ink/50 text-xs font-light mt-0.5 leading-relaxed">
            {group.description}
          </p>
        )}
        {!groupAvailability.pickable && groupAvailability.reason && (
          <p className="font-sans text-ochre text-[11px] italic mt-1">{groupAvailability.reason}</p>
        )}
      </div>
      {group.variants.map((variant, idx) => {
        const { size } = parseItemName(variant.name);
        const qty = cart[variant.id]?.quantity ?? 0;
        const isLast = idx === group.variants.length - 1;
        return (
          <div
            key={variant.id}
            className={`flex items-center gap-3 px-4 py-2.5 ${isLast ? "pb-4" : "border-b border-forest-deep/8"}`}
          >
            <span className="font-sans text-[11px] text-ink/55 px-2.5 py-0.5 border border-ink/15 rounded-full leading-none flex-shrink-0">{size ?? variant.name}</span>
            <span className="flex-1" aria-hidden="true" />
            <span className="font-sans text-ink text-xs font-medium tabular-nums w-12 text-right flex-shrink-0">
              {formatPrice(variant.price)}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {qty > 0 ? (
                <>
                  <button
                    onClick={() => removeFromCart(variant.id)}
                    aria-label={`Remove one ${variant.name}`}
                    className="w-8 h-8 flex items-center justify-center border border-forest-deep/20 text-forest-deep text-base hover:bg-forest-deep/5 transition-colors"
                  >
                    −
                  </button>
                  <span className="font-sans text-forest-deep font-medium text-xs w-4 text-center tabular-nums">
                    {qty}
                  </span>
                </>
              ) : (
                <span className="w-[42px]" aria-hidden="true" />
              )}
              <button
                onClick={() => handleMenuAdd(variant)}
                disabled={!groupAvailability.pickable}
                aria-label={`Add ${variant.name}`}
                className="w-8 h-8 flex items-center justify-center bg-ochre text-parchment-light text-base hover:bg-ochre-light transition-colors disabled:bg-ink/15 disabled:cursor-not-allowed disabled:hover:bg-ink/15"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </li>
    );
  };

  const renderGroup = (group: ItemGroup) =>
    group.variants.length === 1 ? renderMenuItem(group.variants[0]) : renderVariantCard(group);

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

      {/* Discount notice */}
      <div className="bg-forest-deep/95 px-5 py-2 text-center">
        <p className="font-sans text-parchment-light/85 text-[11px] tracking-widest uppercase">
          Students &amp; NHS — show ID at the bar for 10% off
        </p>
      </div>

      {/* Food / Drink toggle — sliding pill */}
      <div className="sticky top-[72px] z-20 border-b border-forest-deep/15 overflow-hidden">
        <div className="relative grid grid-cols-2 bg-parchment-dark">
          <div
            className={`absolute inset-y-0 w-1/2 bg-ochre transition-transform duration-200 ease-out ${
              activeSection === "food" ? "translate-x-full" : "translate-x-0"
            }`}
            aria-hidden="true"
          />
          {(["drink", "food"] as const).map((section) => (
            <button
              key={section}
              onClick={() => handleSectionChange(section)}
              className={`relative z-10 py-3.5 font-sans text-xs tracking-widest uppercase transition-colors duration-200 ${
                activeSection === section ? "text-parchment-light" : "text-ink/50 hover:text-ink"
              }`}
            >
              {section === "drink" ? "Drink" : "Food"}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs — sticky below toggle */}
      <nav
        aria-label="Menu categories"
        className="sticky top-[124px] z-20 bg-parchment-dark overflow-x-auto border-b border-forest-deep/10"
      >
        <div className="flex min-w-max px-3 py-2 gap-1.5">
          {availableGroups.map((g) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(g.label)}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-2.5 rounded-full transition-colors whitespace-nowrap ${
                activeGroup === g.label
                  ? "bg-ochre text-parchment-light"
                  : "text-ink/45 hover:text-ink/70 hover:bg-parchment/50"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Service notices */}
      {ordersPaused && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-4 text-center">
          <p className="font-sans text-sm font-medium text-red-800">
            We&apos;re a bit slammed right now.
          </p>
          <p className="font-sans text-xs text-red-700/80 font-light mt-1 leading-relaxed">
            Online ordering is paused — please flag down a member of staff.
          </p>
        </div>
      )}
      {!ordersPaused && drinkDelayMinutes > 0 && activeSection === "drink" && (
        <div className="bg-ochre/10 border-b border-ochre/30 px-5 py-2.5 text-center">
          <p className="font-sans text-xs text-ink/70 font-light">
            <span className="font-medium text-forest-deep">Heads up:</span> drinks have a ~{drinkDelayMinutes}&nbsp;min wait right now.
          </p>
        </div>
      )}

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
          // Multi-category group: accordion dropdowns per sub-category
          <div className="pt-2">
            {currentGroupDef!.categories.map((cat) => {
              const catItems = menu.filter((i) => i.category === cat);
              if (!catItems.length) return null;
              const isExpanded = expandedCats.has(cat);
              return (
                <div key={cat} className="border-b border-forest-deep/10">
                  <button
                    onClick={() =>
                      setExpandedCats((prev) => {
                        const next = new Set(prev);
                        if (next.has(cat)) next.delete(cat);
                        else next.add(cat);
                        return next;
                      })
                    }
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors border-l-2 ${
                      isExpanded
                        ? "bg-parchment border-ochre"
                        : "bg-parchment-dark hover:bg-parchment border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-sm font-medium text-forest-deep">{cat}</span>
                      <span className="font-sans text-[11px] text-ink/35 tracking-wide">
                        {catItems.length}
                      </span>
                    </div>
                    <span
                      className={`text-ink/40 text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-px" role="list">
                        {groupItems(catItems).map(renderGroup)}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Single-category group: flat list
          <ul className="space-y-px pt-px" role="list">
            {groupItems(visibleItems).map(renderGroup)}
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
                  const dealActive = !!group.item.dealOf2Price && group.item.quantity >= 2;
                  return (
                    <li key={group.item.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-forest-deep font-medium text-sm">{group.item.name}</p>
                        <p className="font-sans text-ink/50 text-xs">
                          {formatPrice(group.item.price)} each
                          {dealActive && (
                            <span className="ml-1 text-ochre">· 2 for {formatPrice(group.item.dealOf2Price!)}</span>
                          )}
                        </p>
                      </div>
                      <ItemControls
                        item={group.item}
                        onRemove={() => removeFromCart(group.item.id)}
                        onAdd={() => addToCart(group.item)}
                      />
                      <p className="font-sans text-ink font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                        {formatPrice(lineTotal(group.item))}
                      </p>
                    </li>
                  );
                }

                const { parent, children } = group;
                return (
                  <li key={parent.id} className="px-5 py-3">
                    <div className="border border-forest-deep/10">
                      <div className="flex items-center gap-4 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-forest-deep font-medium text-sm">{parent.name}</p>
                          <p className="font-sans text-ink/50 text-xs">{formatPrice(parent.price)} each</p>
                        </div>
                        <ItemControls
                          item={parent}
                          onRemove={() => {
                            removeFromCart(parent.id);
                            removeLastPairingFor("parentId", parent.id, parent.quantity);
                          }}
                          onAdd={() => addToCart(parent)}
                        />
                        <p className="font-sans text-ink font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                          {formatPrice(lineTotal(parent))}
                        </p>
                      </div>
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-4 px-4 py-3 bg-parchment-dark/60 border-t border-forest-deep/5"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-ink/70 text-xs font-medium">+ {child.name}</p>
                            <p className="font-sans text-ink/40 text-xs">{formatPrice(child.price)} each</p>
                          </div>
                          <ItemControls
                            item={child}
                            onRemove={() => {
                              removeFromCart(child.id);
                              removeLastPairingFor("childId", child.id, child.quantity);
                            }}
                            onAdd={() => addToCart(child)}
                          />
                          <p className="font-sans text-ink/70 font-medium text-sm w-14 text-right flex-shrink-0 tabular-nums">
                            {formatPrice(lineTotal(child))}
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
                <p className="font-sans text-forest-deep text-base font-semibold tabular-nums">{formatPrice(total)}</p>
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
                disabled={submitting || ordersPaused}
                className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-60 transition-colors"
              >
                {ordersPaused
                  ? "Ordering paused"
                  : submitting
                  ? "Placing order…"
                  : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pizza topping prompt sheet */}
      {pizzaToppingFor && (
        <div
          ref={pizzaSheetRef}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-label="Add extra toppings"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setPizzaToppingFor(null)} />
          <div className="relative bg-parchment max-h-[70vh] flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-forest-deep/10">
              <div>
                <h2 className="font-serif font-light text-forest-deep text-xl">Add extra toppings?</h2>
                <p className="font-sans text-ink/50 text-xs mt-0.5">
                  You&apos;ve added {pizzaToppingFor.name}
                </p>
              </div>
              <button
                onClick={() => setPizzaToppingFor(null)}
                aria-label="No toppings, close"
                className="w-10 h-10 flex items-center justify-center text-ink/40 hover:text-ink transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <ul className="divide-y divide-forest-deep/5 flex-1 overflow-y-auto">
              {pizzaToppings.map((topping) => {
                const qty = cart[topping.id]?.quantity ?? 0;
                return (
                  <li key={topping.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-forest-deep text-sm font-medium">{topping.name}</p>
                      {topping.description && (
                        <p className="font-sans text-ink/50 text-xs font-light mt-0.5 leading-relaxed">
                          {topping.description}
                        </p>
                      )}
                    </div>
                    <p className="font-sans text-ink/60 text-sm tabular-nums flex-shrink-0">
                      {formatPrice(topping.price)}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {qty > 0 ? (
                        <>
                          <button
                            onClick={() => {
                              removeFromCart(topping.id);
                              removeLastPairingFor("childId", topping.id, qty);
                            }}
                            aria-label={`Remove one ${topping.name}`}
                            className="w-8 h-8 flex items-center justify-center border border-forest-deep/20 text-forest-deep text-base hover:bg-forest-deep/5 transition-colors"
                          >
                            −
                          </button>
                          <span className="font-sans text-forest-deep font-medium text-xs w-4 text-center tabular-nums">
                            {qty}
                          </span>
                        </>
                      ) : null}
                      <button
                        onClick={() => {
                          addToCart(topping);
                          setPairings((prev) => [
                            ...prev,
                            { parentId: pizzaToppingFor.id, childId: topping.id },
                          ]);
                        }}
                        aria-label={`Add ${topping.name}`}
                        className="w-9 h-9 flex items-center justify-center bg-ochre text-parchment-light text-lg hover:bg-ochre-light transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div
              className="px-5 pt-4 border-t border-forest-deep/10 bg-parchment"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={() => setPizzaToppingFor(null)}
                className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steak customisation sheet */}
      {steakPendingItem && (
        <div
          ref={steakSheetRef}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-label="Customise your steak"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSteakPendingItem(null)} />
          <div className="relative bg-parchment max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-forest-deep/10">
              <div>
                <h2 className="font-serif font-light text-forest-deep text-xl">How would you like your steak?</h2>
                <p className="font-sans text-ink/50 text-xs mt-0.5">{steakPendingItem.name}</p>
              </div>
              <button
                onClick={() => setSteakPendingItem(null)}
                aria-label="Cancel"
                className="w-10 h-10 flex items-center justify-center text-ink/40 hover:text-ink transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">
              <fieldset>
                <legend className="font-sans text-[10px] tracking-widest uppercase text-ink/40 mb-3">Doneness</legend>
                <div className="grid grid-cols-3 gap-2">
                  {["Very Rare", "Rare", "Medium Rare", "Medium", "Medium Well", "Well Done"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSteakDoneness(opt)}
                      className={`py-2.5 px-2 font-sans text-xs text-center transition-colors border ${
                        steakDoneness === opt
                          ? "bg-ochre border-ochre text-parchment-light"
                          : "border-forest-deep/20 text-ink/60 hover:border-forest-deep/40 hover:text-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="font-sans text-[10px] tracking-widest uppercase text-ink/40 mb-3">Sauce</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["Peppercorn", "Garlic Butter", "No sauce"] as const).map((opt) => {
                    const extra = STEAK_SAUCE_PRICES[opt];
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSteakSauce(opt)}
                        className={`py-2.5 px-2 font-sans text-xs text-center transition-colors border ${
                          steakSauce === opt
                            ? "bg-ochre border-ochre text-parchment-light"
                            : "border-forest-deep/20 text-ink/60 hover:border-forest-deep/40 hover:text-ink"
                        }`}
                      >
                        <span>{opt}</span>
                        {extra > 0 && (
                          <span className="block text-[10px] opacity-80">+{formatPrice(extra)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
            <div
              className="px-5 pt-4 border-t border-forest-deep/10 bg-parchment"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={confirmSteak}
                className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light transition-colors"
              >
                Add to order
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
                                { parentId: mixerPromptFor.id, childId: mixer.id },
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

      {/* Generic option prompt (spritz mixer, J2O flavour, ice cream / sorbet flavour) */}
      {optionPromptFor && (
        <div
          ref={optionSheetRef}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-label={`Choose ${optionPromptFor.def.legend.toLowerCase()}`}
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOptionPromptFor(null)} />
          <div className="relative bg-parchment flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-forest-deep/10">
              <div>
                <h2 className="font-serif font-light text-forest-deep text-xl">
                  Choose your {optionPromptFor.def.legend.toLowerCase()}
                </h2>
                <p className="font-sans text-ink/50 text-xs mt-0.5">
                  {optionPromptFor.item.name}
                </p>
              </div>
              <button
                onClick={() => setOptionPromptFor(null)}
                aria-label="Cancel"
                className="w-10 h-10 flex items-center justify-center text-ink/40 hover:text-ink transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {optionPromptFor.def.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => confirmOption(choice)}
                    className="py-3 px-3 font-sans text-sm text-center border border-forest-deep/20 text-forest-deep hover:bg-ochre hover:border-ochre hover:text-parchment-light transition-colors"
                  >
                    {choice}
                  </button>
                ))}
              </div>
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
