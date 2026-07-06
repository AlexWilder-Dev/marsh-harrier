"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  MONTHS,
  WEEKDAYS,
  buildMonthGrid,
  datesInRange,
  formatGBP,
  longDate,
  nightlyPrice,
  startOfMonth,
  todayLocal,
  ymd,
} from "@/lib/calendar";

// ─── Data (replace with real content when client delivers) ───────────────────

const ROOM_IMAGES = [
  { src: "/images/marsh-harrier-pub-room-bedroom.avif",      alt: "Guest bedroom" },
  { src: "/images/marsh-harrier-pub-room-living-space.avif", alt: "Living space" },
  { src: "/images/marsh-harrier-pub-room-kitchen.avif",      alt: "Kitchen" },
  { src: "/images/marsh-harrier-pub-room-bathroom.avif",     alt: "En-suite bathroom" },
  { src: "/images/marsh-harrier-pub-room-bedroom2.avif",     alt: "Bedroom detail" },
  { src: "/images/marsh-harrier-pub-room-shower.avif",       alt: "Walk-in shower" },
  { src: "/images/marsh-harrier-pub-room-kitchen2.avif",     alt: "Kitchen detail" },
  { src: "/images/marsh-harrier-pub-room-books.avif",        alt: "Reading corner" },
  { src: "/images/marsh-harrier-pub-room-table.avif",        alt: "Dining area" },
  { src: "/images/marsh-harrier-pub-room-outdoor.avif",      alt: "Private outdoor space" },
];

const AMENITIES = [
  "Secure key collection",
  "Free WiFi",
  "Flat-screen TV",
  "Tea and coffee making facilities",
  "Towels and linen provided",
  "Private entrance",
  "Ground-floor access",
  "Secure key lockbox",
];

const HIGHLIGHTS = [
  { label: "WiFi", value: "Included" },
  { label: "Bedrooms", value: "2" },
  { label: "Occupancy", value: "Up to 4" },
  { label: "From", value: "On enquiry" },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function RoomsHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={ref}
      className="relative h-[70vh] min-h-[480px] overflow-hidden flex items-end"
      aria-label="Rooms hero"
    >
      <motion.div
        className="absolute inset-0 scale-[1.12]"
        style={{ y: imageY }}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/marsh-harrier-pub-front.webp"
          alt="The Marsh Harrier exterior — 40 Marsh Road, Cowley"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchPriority="high"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/30 to-forest-deep/50"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-deep/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 px-6 md:px-16 lg:px-24 pb-16 max-w-7xl w-full">
        <motion.p
          className="font-sans text-parchment-light text-xs tracking-widest uppercase mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          Stay at the pub
        </motion.p>
        <motion.h1
          className="font-serif font-light text-parchment-light text-display-xl leading-[0.9]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
        >
          Rooms at the
          <br />
          <em className="italic text-parchment-light block ml-[6vw] md:ml-[10vw]">
            Marsh Harrier.
          </em>
        </motion.h1>
        <motion.p
          className="font-serif italic text-ochre text-lg md:text-xl mt-6 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.85 }}
        >
          Book a room directly through our website and enjoy a free bottle of wine on arrival!
        </motion.p>
      </div>
    </section>
  );
}

// ─── Description ─────────────────────────────────────────────────────────────

function RoomsDescription() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="bg-parchment py-24 md:py-36 overflow-hidden"
      aria-label="Room description"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">
              The room
            </p>
            <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9] mb-8">
              Wake up above
              <br />
              <em className="italic">the best pub</em>
              <br />
              in Cowley.
            </h2>
            <div className="flex flex-col gap-1 mb-10">
              <div className="rule-ochre w-20" />
              <div className="rule-ochre w-10 opacity-40" />
            </div>
            <p className="font-sans text-ink/65 text-base leading-relaxed font-light mb-5">
              Two comfortable, well-appointed bedrooms above The Marsh Harrier,
              sleeping up to four. A proper home in the heart of Cowley — ideal
              for visitors to Oxford who want something with more character than
              a chain hotel.
            </p>
            <p className="font-sans text-ink/65 text-base leading-relaxed font-light">
              Wake up to a proper breakfast, step downstairs for a perfect pint,
              and fall asleep somewhere that actually has a soul.
            </p>
          </motion.div>

          {/* Highlights grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="grid grid-cols-2 gap-px bg-forest-deep/10"
          >
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.label}
                className="bg-parchment-light px-5 py-7 flex flex-col"
              >
                <p className="font-sans text-[15px] tracking-widest uppercase text-ink mb-2">
                  {h.label}
                </p>
                <p className="font-serif font-light text-forest-deep text-xl md:text-2xl leading-tight">
                  {h.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Amenities ───────────────────────────────────────────────────────────────

function RoomsAmenities() {
  return (
    <section
      className="bg-ochre py-24 md:py-32 overflow-hidden relative"
      aria-label="Room amenities"
    >
      <div
        className="absolute -left-4 top-0 bottom-0 font-serif text-[22vw] leading-none text-parchment/15 select-none pointer-events-none flex items-center"
        aria-hidden="true"
      >
        &amp;
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4">
            What&apos;s included
          </p>
          <h2 className="font-serif font-light text-ink text-display-lg leading-[0.9]">
            Everything you need.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0">
          {AMENITIES.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: i * 0.06,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-t border-parchment-light/10 py-5 pr-6 flex items-start gap-3"
            >
              <span
                className="w-1 h-1 rounded-full bg-ochre flex-shrink-0 mt-2"
                aria-hidden="true"
              />
              <p className="font-sans text-ink/70 text-sm font-light leading-relaxed">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function RoomsGallery() {
  return (
    <section
      className="bg-parchment-dark py-24 md:py-32"
      aria-label="Room photo gallery"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4">
            Take a look
          </p>
          <h2 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9]">
            The space.
          </h2>
        </motion.div>
      </div>

      {/* Asymmetric grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-3 gap-2">
        {ROOM_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.08,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative overflow-hidden ${
              i === 0 ? "col-span-2 md:col-span-2 aspect-[16/9]" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Enquiry Form ─────────────────────────────────────────────────────────────

type FormState = "idle" | "submitting" | "success" | "error";

// Calendar range picker for the enquiry form. Booked nights (from
// /api/bookings) and past dates are blocked out; the chosen check-in/check-out
// feed hidden inputs so the existing Formspree submission is unchanged.
function BookingCalendar() {
  const today = useMemo(() => todayLocal(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(todayLocal()));
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [weekdayPrice, setWeekdayPrice] = useState(0);
  const [weekendPrice, setWeekendPrice] = useState(0);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/bookings").then((r) =>
        r.ok ? r.json() : { booked: [], prices: {} }
      ),
      fetch("/api/settings").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([b, s]) => {
        if (cancelled) return;
        setBooked(new Set(b.booked ?? []));
        setPrices(b.prices ?? {});
        if (s) {
          setWeekdayPrice(Number(s.roomWeekdayPrice) || 0);
          setWeekendPrice(Number(s.roomWeekendPrice) || 0);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const todayYmd = ymd(today);
  const monthLabel = `${MONTHS[monthAnchor.getMonth()]} ${monthAnchor.getFullYear()}`;
  const atCurrentMonth =
    monthAnchor.getFullYear() === today.getFullYear() &&
    monthAnchor.getMonth() === today.getMonth();

  const priceFor = (date: string) =>
    nightlyPrice(date, prices, weekdayPrice, weekendPrice);

  // Occupied nights for a stay are [checkIn, checkOut) — the check-out day
  // itself is not slept in, so a booking can end the morning of a booked night.
  const rangeHasBooked = (start: string, end: string) =>
    datesInRange(start, end, true).some((d) => booked.has(d));

  const stayNights =
    checkIn && checkOut ? datesInRange(checkIn, checkOut, true) : [];
  const nights = stayNights.length;
  const stayTotal = stayNights.reduce((sum, d) => sum + priceFor(d), 0);

  const pick = (date: string) => {
    setNotice(null);
    // Fresh selection: no check-in yet, or a completed range → start over.
    if (!checkIn || checkOut) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    // Second click on/before the check-in → treat as a new check-in.
    if (date <= checkIn) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    if (rangeHasBooked(checkIn, date)) {
      setNotice(
        "Those dates include a night that's already booked. Please pick a range that doesn't overlap a booked night."
      );
      return;
    }
    setCheckOut(date);
  };

  const clear = () => {
    setCheckIn(null);
    setCheckOut(null);
    setNotice(null);
  };

  return (
    <div className="bg-parchment border border-ink/15">
      {/* Hidden inputs — read by the form's FormData on submit */}
      <input type="hidden" name="checkin" value={checkIn ?? ""} />
      <input type="hidden" name="checkout" value={checkOut ?? ""} />

      {/* Month header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="font-serif font-light text-ink text-lg">{monthLabel}</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setMonthAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1))
            }
            disabled={atCurrentMonth}
            aria-label="Previous month"
            className="w-9 h-9 flex items-center justify-center border border-ink/15 text-ink/70 hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() =>
              setMonthAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1))
            }
            aria-label="Next month"
            className="w-9 h-9 flex items-center justify-center border border-ink/15 text-ink/70 hover:bg-ink/5 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-ink/10 border-y border-ink/10">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-parchment py-2 text-center font-sans text-[10px] tracking-widest uppercase text-ink/45"
          >
            {w}
          </div>
        ))}
        {monthGrid.map((d) => {
          const cellYmd = ymd(d);
          const inMonth = d.getMonth() === monthAnchor.getMonth();
          const isPast = cellYmd < todayYmd;
          const isBooked = booked.has(cellYmd);
          const isCheckIn = cellYmd === checkIn;
          const isCheckOut = cellYmd === checkOut;
          const inRange =
            checkIn !== null &&
            checkOut !== null &&
            cellYmd >= checkIn &&
            cellYmd <= checkOut;
          const disabled = isPast || isBooked;

          if (disabled) {
            return (
              <div
                key={cellYmd}
                aria-label={isBooked ? `${cellYmd}, booked` : undefined}
                className={`min-h-[54px] flex items-center justify-center font-sans text-xs tabular-nums ${
                  isBooked
                    ? "bg-red-100 text-red-400 line-through"
                    : "bg-parchment text-ink/25"
                } ${inMonth ? "" : "opacity-40"}`}
              >
                {d.getDate()}
              </div>
            );
          }

          const selected = isCheckIn || isCheckOut;
          const price = priceFor(cellYmd);
          return (
            <button
              key={cellYmd}
              type="button"
              onClick={() => pick(cellYmd)}
              aria-label={`${cellYmd}${price > 0 ? `, ${formatGBP(price)}` : ""}${
                isCheckIn ? ", check-in" : isCheckOut ? ", check-out" : ""
              }`}
              aria-pressed={selected}
              className={`min-h-[54px] flex flex-col items-center justify-center gap-0.5 font-sans tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-inset ${
                selected
                  ? "bg-forest-deep text-parchment-light font-medium"
                  : inRange
                  ? "bg-forest-deep/15 text-forest-deep"
                  : "bg-parchment text-ink/70 hover:bg-forest-deep/10"
              } ${inMonth ? "" : "opacity-40"}`}
            >
              <span className="text-xs">{d.getDate()}</span>
              {price > 0 && (
                <span
                  className={`text-[9px] leading-none ${
                    selected ? "text-parchment-light/80" : "text-ink/45"
                  }`}
                >
                  {formatGBP(price)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection summary */}
      <div className="px-4 py-3">
        {checkIn ? (
          <div className="flex items-start justify-between gap-3">
            <div className="font-sans text-sm text-ink/80 leading-relaxed">
              <span className="font-medium text-ink">{longDate(checkIn)}</span>
              {checkOut ? (
                <>
                  {" → "}
                  <span className="font-medium text-ink">{longDate(checkOut)}</span>
                  <span className="text-ink/50">
                    {" "}
                    · {nights} night{nights !== 1 ? "s" : ""}
                    {stayTotal > 0 && (
                      <>
                        {" · "}
                        <span className="font-medium text-ink">
                          {formatGBP(stayTotal)}
                        </span>{" "}
                        total
                      </>
                    )}
                  </span>
                </>
              ) : (
                <span className="text-ink/50"> · now pick your check-out date</span>
              )}
            </div>
            <button
              type="button"
              onClick={clear}
              className="font-sans text-[11px] tracking-widest uppercase text-ink/50 hover:text-ink transition-colors flex-shrink-0"
            >
              Clear
            </button>
          </div>
        ) : (
          <p className="font-sans text-sm text-ink/50">
            Pick your check-in date, then your check-out date.
          </p>
        )}
        {notice && (
          <p className="font-sans text-xs text-red-600 mt-2 leading-relaxed">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}

function EnquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Validate dates
    const todayStr = new Date().toISOString().split("T")[0];
    const checkInStr = (data.get("checkin") as string) || "";
    const checkOutStr = (data.get("checkout") as string) || "";
    if (!checkInStr || !checkOutStr) {
      setErrorMsg("Please choose your check-in and check-out dates on the calendar.");
      setState("error");
      return;
    }
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    if (checkInStr < todayStr) {
      setErrorMsg("Check-in date cannot be in the past.");
      setState("error");
      return;
    }
    if (checkOut <= checkIn) {
      setErrorMsg("Check-out date must be after check-in date.");
      setState("error");
      return;
    }

    // Post to our own server route, which forwards to Formspree. This avoids
    // depending on a build-time NEXT_PUBLIC_ env var being present in the
    // browser bundle — the server reads the Formspree ID at runtime.
    const payload = Object.fromEntries(data.entries());
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setState("success");
        form.reset();
        return;
      }

      if (res.status === 503) {
        setErrorMsg(
          "Sorry — our online booking form isn't available right now. Please call us on 01865 718225 to make your enquiry."
        );
      } else {
        setErrorMsg(
          "Sorry, we couldn't send your enquiry. Please try again, or call us on 01865 718225."
        );
      }
      setState("error");
    } catch {
      setErrorMsg(
        "Could not connect. Please check your connection and try again, or call us on 01865 718225."
      );
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <div className="w-14 h-14 rounded-full border border-ink/25 flex items-center justify-center mb-8">
          <span className="font-serif italic text-ink text-xl">✓</span>
        </div>
        <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4">
          Enquiry received
        </p>
        <h3 className="font-serif font-light text-ink text-display-sm mb-4">
          Thanks — we&apos;ll be in touch within 24 hours.
        </h3>
        <p className="font-sans text-ink/60 text-sm font-light max-w-sm">
          We check messages daily and will confirm availability and pricing as
          soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2"
          >
            Full Name <span aria-label="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full bg-parchment border border-ink/15 text-ink font-sans text-base px-4 py-3.5 placeholder-ink/25 focus:outline-none focus:border-ink/40 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2"
          >
            Email <span aria-label="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full bg-parchment border border-ink/15 text-ink font-sans text-base px-4 py-3.5 placeholder-ink/25 focus:outline-none focus:border-ink/40 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2"
        >
          Phone <span className="text-ink/30">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full bg-parchment border border-ink/15 text-ink font-sans text-base px-4 py-3.5 placeholder-ink/25 focus:outline-none focus:border-ink/40 transition-colors"
          placeholder="+44 7700 000000"
        />
      </div>

      {/* Check-in + Check-out — calendar range picker */}
      <div>
        <span className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2">
          Your dates <span aria-label="required">*</span>
        </span>
        <BookingCalendar />
      </div>

      {/* Guests */}
      <div>
        <label
          htmlFor="guests"
          className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2"
        >
          Number of Guests <span aria-label="required">*</span>
        </label>
        <div className="relative">
          <select
            id="guests"
            name="guests"
            required
            defaultValue=""
            className="w-full bg-parchment border border-ink/15 text-ink font-sans text-base px-4 py-3.5 pr-10 focus:outline-none focus:border-ink/40 transition-colors appearance-none"
          >
            <option value="" disabled>
              Select
            </option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 text-xs"
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2"
        >
          Message <span className="text-ink/30">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full bg-parchment border border-ink/15 text-ink font-sans text-base px-4 py-3.5 placeholder-ink/25 focus:outline-none focus:border-ink/40 transition-colors resize-none"
          placeholder="Anything we should know — special occasions, early arrival, etc."
        />
      </div>

      {(state === "error" && errorMsg) && (
        <p className="font-sans text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-parchment text-ink hover:bg-parchment-dark disabled:opacity-60 transition-colors"
      >
        {state === "submitting" ? "Sending…" : "Send Enquiry"}
      </button>

      <p className="font-sans text-ink/35 text-xs text-center leading-relaxed">
        We&apos;ll reply within 24 hours. No booking fee — we confirm directly
        by email.
      </p>
    </form>
  );
}

function RoomsEnquiry() {
  return (
    <section
      id="enquiry"
      className="bg-ochre py-24 md:py-36 overflow-hidden"
      aria-label="Room enquiry form"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">
              Make an enquiry
            </p>
            <h2 className="font-serif font-light text-ink text-display-xl leading-[0.9] mb-8">
              Book your
              <br />
              <em className="italic text-ink">stay.</em>
            </h2>
            <div className="flex flex-col gap-1 mb-10">
              <div className="rule-ochre w-20" />
              <div className="rule-ochre w-10 opacity-40" />
            </div>
            <p className="font-sans text-ink/65 text-base leading-relaxed font-light mb-6">
              Fill in the form and we&apos;ll come back to you within 24 hours
              to confirm availability and answer any questions.
            </p>
            <p className="font-sans text-ink/80 text-base leading-relaxed font-light mb-6 border-l-2 border-ink/30 pl-4">
              Payment is made by bank transfer. Once we&apos;ve confirmed your
              dates, we&apos;ll email you the transfer details — payment must be
              made to secure your booking.
            </p>
            <p className="font-sans text-ink/65 text-base leading-relaxed font-light">
              Prefer to call? Find us at{" "}
              <strong className="font-medium text-ink">
                40 Marsh Road, Cowley, Oxford OX4 2HH
              </strong>
              .
            </p>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <EnquiryForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoomsPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <RoomsHero />
        <RoomsDescription />
        <RoomsAmenities />
        <RoomsGallery />
        <RoomsEnquiry />
      </main>
      <Footer />
    </>
  );
}
