"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Counter from "./Counter";

const hours = [
  { day: "Monday",    openH: 4,  openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm" },
  { day: "Tuesday",   openH: 4,  openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm" },
  { day: "Wednesday", openH: 4,  openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm" },
  { day: "Thursday",  openH: 4,  openSuffix: ":00pm", closeH: 11, closeSuffix: ":00pm" },
  { day: "Friday",    openH: 3,  openSuffix: ":00pm", closeH: 12, closeSuffix: ":00am" },
  { day: "Saturday",  openH: 12, openSuffix: ":00pm", closeH: 12, closeSuffix: ":00am" },
  { day: "Sunday",    openH: 12, openSuffix: ":00pm", closeH: 10, closeSuffix: ":30pm", note: "Roasts from noon" },
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
      className={`flex items-start sm:items-center justify-between py-5 border-b gap-4 ${
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
            <span className="ml-2 font-sans text-ochre text-[10px] tracking-widest uppercase">
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
          aria-label={`Opens ${row.openH}${row.openSuffix}, closes ${row.closeH}${row.closeSuffix}`}
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
        {row.note && (
          <p className="font-sans text-ochre text-[10px] tracking-wide uppercase mt-0.5">
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
      className="bg-parchment-dark py-28 md:py-40 relative overflow-hidden"
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
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">
            When to find us
          </p>
          <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9]">
            Opening Hours
          </h2>
          <p className="font-serif italic text-forest-deep/30 text-display-sm mt-2">
            The Marsh Harrier, Cowley
          </p>
        </motion.div>

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
