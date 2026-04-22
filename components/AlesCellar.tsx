"use client";

import { motion } from "framer-motion";
import Counter from "./Counter";

const stats = [
  { to: 4, suffix: "", label: "Rotating guest ales", detail: "New casks every week, sourced from the best regional breweries." },
  { to: 15, suffix: "+", label: "Years serving Cowley", detail: "A fixture of the community. Known, trusted, and genuinely loved." },
  { to: 1, suffix: "", label: "Master Cellarman award", detail: "Recognised for maintaining the highest standard of cask ale." },
];

export default function AlesCellar() {
  return (
    <section
      id="ales"
      className="bg-parchment py-28 md:py-40 overflow-hidden relative"
      aria-label="Ales and cellar"
    >
      {/* Faint background texture */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/marsh-harrier-pub-bar.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 md:mb-28 max-w-3xl"
        >
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">
            Ales &amp; The Cellar
          </p>
          <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9] text-balance">
            A perfect pint,
            <br />
            <em className="italic">every single time.</em>
          </h2>
          {/* Double rule stack */}
          <div className="flex flex-col gap-1 mt-8">
            <div className="rule-ochre w-24" />
            <div className="rule-ochre w-12 opacity-40" />
          </div>
        </motion.div>

        {/* Stats — column treatment with left ochre border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 mb-24 md:mb-32">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="border-l border-ochre/20 pl-8 md:pr-12 py-2"
            >
              <div
                className="font-serif font-light text-display-2xl text-forest-rich mb-2 leading-none"
                aria-hidden="true"
              >
                <Counter to={stat.to} suffix={stat.suffix} duration={2000} />
              </div>
              <p className="font-sans text-xs tracking-widest uppercase text-ochre mb-3">
                {stat.label}
              </p>
              <p className="font-sans text-ink/55 text-sm leading-relaxed font-light">
                {stat.detail}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Master Cellarman callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-start md:items-center gap-10 p-8 md:p-12 bg-forest-deep"
        >
          {/* Stamp with outer ring */}
          <div className="relative flex-shrink-0" role="img" aria-label="Master Cellarman award">
            <div className="absolute -inset-2 rounded-full border border-ochre/20" aria-hidden="true" />
            <div className="w-36 h-36 rounded-full border border-ochre/60 flex flex-col items-center justify-center text-center px-4">
              <p className="font-sans text-ochre text-[9px] tracking-widest uppercase leading-tight mb-1">Status</p>
              <p className="font-serif italic text-parchment-light text-sm leading-tight">Master Cellarman</p>
              <div className="w-8 h-px bg-ochre/40 my-2" />
              <p className="font-sans text-parchment-light/40 text-[8px] tracking-widest uppercase">The Marsh Harrier</p>
            </div>
          </div>
          <div>
            <h3 className="font-serif font-light text-parchment-light text-display-sm mb-3">
              Cellarmanship isn&apos;t a given.
            </h3>
            <p className="font-sans text-parchment-light/55 text-sm leading-relaxed font-light max-w-lg">
              Master Cellarman status is awarded to pubs that maintain the highest standards
              of cask ale storage, conditioning, and service. It means every pint you&apos;re
              served has been looked after properly — from the brewery to your glass.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
