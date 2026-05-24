"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Counter from "./Counter";

const hours = [
  { day: "Monday",    openH: 5,  openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "6–9pm" },
  { day: "Tuesday",   openH: 12, openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "noon–3pm & 6–9pm" },
  { day: "Wednesday", openH: 12, openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "noon–3pm & 6–9pm" },
  { day: "Thursday",  openH: 12, openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "noon–3pm & 4–9pm" },
  { day: "Friday",    openH: 12, openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "noon–3pm & 4–9pm" },
  { day: "Saturday",  openH: 12, openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "noon–3pm & 4–9pm" },
  { day: "Sunday",    openH: 12, openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm", food: "noon–4pm & 5–8pm", note: "Roasts from noon · Pizzas only 5–8pm" },
];

function getTodayName() {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
}

function HourRow({ row, index }: { row: typeof hours[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const today = getTodayName() === row.day;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start justify-between py-5 border-b gap-4 ${
        today ? "border-ochre/40 bg-ochre/[0.04]" : "border-forest-deep/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`font-sans text-base ${
            today ? "text-forest-deep font-medium" : "text-ink/55 font-light"
          }`}
        >
          {row.day}
          {today && (
            <span className="ml-2 font-sans text-ink text-[15px] tracking-widest uppercase">
              Today
            </span>
          )}
        </span>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className={`font-sans text-base tabular-nums ${
            today ? "text-forest-deep" : "text-ink/55 font-light"
          }`}
          aria-label={`Bar opens ${row.openH}${row.openSuffix}, closes ${row.closeH}${row.closeSuffix}`}
        >
          {isInView ? (
            <>
              <Counter to={row.openH} suffix={row.openSuffix} duration={1200} />
              {" — "}
              <Counter to={row.closeH} suffix={row.closeSuffix} duration={1400} />
            </>
          ) : (
            <span className="text-ink/20">–</span>
          )}
        </p>
        <p
          className={`font-sans text-xs mt-0.5 ${
            today ? "text-ochre/80" : "text-ink/35 font-light"
          }`}
        >
          Kitchen: {row.food}
        </p>
        {row.note && (
          <p className="font-sans text-ink text-[13px] tracking-wide uppercase mt-0.5">
            {row.note}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function OpeningHours() {
  return (
    <section
      id="opening-hours"
      className="bg-parchment-dark py-24 sm:py-36 md:py-52 relative overflow-hidden"
      aria-label="Opening hours"
    >
      {/* Full-height decorative H letterform */}
      <div
        className="absolute -right-4 top-0 bottom-0 font-serif text-[28vw] md:text-[20vw] leading-none text-forest-deep/[0.045] select-none pointer-events-none flex items-center"
        aria-hidden="true"
      >
        H
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">
            When to find us
          </p>
          <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9]">
            Opening Hours
          </h2>
          <p className="font-serif italic text-forest-deep/30 text-display-sm mt-2">
            The Marsh Harrier, Cowley
          </p>
        </motion.div>

        {/* Column headers */}
        <div className="flex justify-between pb-3 border-b border-forest-deep/10 mb-1">
          <span className="font-sans text-[11px] tracking-widest uppercase text-ink/30">Day</span>
          <div className="text-right">
            <span className="font-sans text-[11px] tracking-widest uppercase text-ink/30">Bar · Kitchen</span>
          </div>
        </div>

        <div role="list" aria-label="Opening hours by day">
          {hours.map((row, i) => (
            <div key={row.day} role="listitem">
              <HourRow row={row} index={i} />
            </div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-serif italic text-forest-deep/40 text-sm mt-8"
        >
          Hours may vary on bank holidays. Call ahead to confirm.
        </motion.p>
      </div>
    </section>
  );
}
