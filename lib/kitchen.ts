// Shared kitchen-window rules — imported by the customer ordering page AND
// the /api/orders endpoint so a hand-crafted POST can't sneak through.
//
// All times are evaluated in Europe/London regardless of the caller's
// timezone (matters for the browser; server clocks are UTC in serverless).

export const FOOD_CATEGORIES = new Set([
  "Starters",
  "Mains",
  "Pizza",
  "Sunday Roast",
  "Sides",
  "Salads",
  "Vegan",
  "Children's",
  "Puddings",
  "Specials",
]);

// Chicken Nuggets (247) and Fish Fingers (248) — the only kids items
// served during Sunday lunch.
export const SUNDAY_LUNCH_KIDS_ITEM_IDS = new Set([247, 248]);

export type ServiceWindow =
  | "weekday"
  | "sunday-lunch"
  | "sunday-dinner"
  | "sunday-closed";

function getUkDayAndMins(): { day: number; mins: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const w = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return { day: weekdayMap[w] ?? 1, mins: h * 60 + m };
}

export function currentServiceWindow(): ServiceWindow {
  const { day, mins } = getUkDayAndMins();
  if (day !== 0) return "weekday";
  if (mins >= 12 * 60 && mins < 16 * 60) return "sunday-lunch";
  if (mins >= 17 * 60 && mins < 20 * 60) return "sunday-dinner";
  return "sunday-closed";
}

export type ItemAvailability = { pickable: boolean; reason?: string };

export function pickabilityFor(
  item: { id: number; category: string },
  window: ServiceWindow
): ItemAvailability {
  // Drinks and anything non-food are always pickable
  if (!FOOD_CATEGORIES.has(item.category)) return { pickable: true };

  if (window === "sunday-lunch") {
    if (item.category === "Sunday Roast") return { pickable: true };
    if (item.category === "Puddings") return { pickable: true };
    if (item.category === "Children's" && SUNDAY_LUNCH_KIDS_ITEM_IDS.has(item.id)) {
      return { pickable: true };
    }
    return { pickable: false, reason: "Sunday lunch service (12–4pm): roast menu only" };
  }
  if (window === "sunday-dinner") {
    if (item.category === "Pizza") return { pickable: true };
    return { pickable: false, reason: "Sunday evening (5–8pm): pizza only" };
  }
  if (window === "sunday-closed") {
    return { pickable: false, reason: "Sunday kitchen: roasts 12–4pm, pizza 5–8pm" };
  }
  // weekday
  if (item.category === "Sunday Roast") {
    return { pickable: false, reason: "Roast menu — Sundays 12–4pm only" };
  }
  return { pickable: true };
}
