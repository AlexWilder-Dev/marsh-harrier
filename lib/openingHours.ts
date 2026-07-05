// Canonical opening-hours shape, shared by the DB seed, the API fallback, the
// admin editor, and the public display. Times are free text so staff can
// express split service ("noon–3pm & 6–9pm"), "Closed", roasts-only, etc.

export type OpeningHour = {
  order: number; // 0 = Monday … 6 = Sunday
  day: string; // "Monday"
  bar: string; // free text, e.g. "12pm – 11pm" or "Closed"
  kitchen: string; // free text, e.g. "noon–3pm & 6–9pm"
  note?: string | null; // optional extra line
};

export const DEFAULT_OPENING_HOURS: OpeningHour[] = [
  { order: 0, day: "Monday",    bar: "5pm – 11pm",  kitchen: "6–9pm" },
  { order: 1, day: "Tuesday",   bar: "12pm – 11pm", kitchen: "noon–3pm & 6–9pm" },
  { order: 2, day: "Wednesday", bar: "12pm – 11pm", kitchen: "noon–3pm & 6–9pm" },
  { order: 3, day: "Thursday",  bar: "12pm – 11pm", kitchen: "noon–3pm & 4–9pm" },
  { order: 4, day: "Friday",    bar: "12pm – 11pm", kitchen: "noon–3pm & 4–9pm" },
  { order: 5, day: "Saturday",  bar: "12pm – 11pm", kitchen: "noon–3pm & 4–9pm" },
  {
    order: 6,
    day: "Sunday",
    bar: "12pm – 11pm",
    kitchen: "12pm–4pm roast & 5–8pm pizza",
    note: "Roasts 12pm–4pm · Pizzas only 5–8pm",
  },
];
