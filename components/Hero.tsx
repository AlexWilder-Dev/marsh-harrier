"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={ref}
      aria-label="Hero — The Marsh Harrier"
      className="relative h-screen min-h-[600px] overflow-hidden flex items-center"
    >
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 scale-[1.15]"
        style={{ y: imageY }}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/marsh-harrier-pub-front.avif"
          alt="The Marsh Harrier exterior — 40 Marsh Road, Cowley"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchPriority="high"
        />
      </motion.div>

      {/* Gradients — stronger top, breathing mid-frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/75 via-forest-deep/20 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/55 to-transparent" aria-hidden="true" />

      {/* Bottom bleed into parchment */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-parchment to-transparent z-10 pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-20 px-6 md:px-16 lg:px-24 max-w-7xl w-full">
        <motion.p
          className="font-sans text-ochre text-xs tracking-widest uppercase mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        >
          40 Marsh Road · Cowley · Oxford
        </motion.p>

        {/* Staircase headline */}
        <motion.h1
          className="font-serif font-light text-parchment-light text-display-3xl"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
        >
          A beer fan&apos;s
          <br />
          <em className="italic text-ochre-light block ml-[8vw] md:ml-[18vw]">haven.</em>
        </motion.h1>

        {/* Sub-copy aligns with the indented italic line */}
        <motion.p
          className="font-sans text-parchment-light/65 text-base md:text-lg font-light max-w-xs mb-10 leading-relaxed mt-8 md:ml-[18vw]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.85 }}
        >
          Master Cellarman status.
          <br />
          A perfect pint, every time.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 md:ml-[18vw]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
        >
          <a
            href="#food"
            className="font-sans text-xs tracking-widest uppercase px-8 py-4 bg-ochre text-parchment-light hover:bg-ochre-light transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-parchment-light"
          >
            View Menu
          </a>
          <a
            href="#find-us"
            className="font-sans text-xs tracking-widest uppercase px-8 py-4 border border-parchment-light/40 text-parchment-light hover:bg-parchment-light/10 hover:border-parchment-light/70 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-parchment-light"
          >
            Find Us
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — left edge, rotated vertical */}
      <motion.div
        className="absolute bottom-16 left-8 z-20 flex items-center gap-3 rotate-[-90deg] origin-bottom-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className="font-sans text-parchment-light/35 text-[15px] tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-10 h-px bg-gradient-to-r from-ochre/70 to-transparent"
          animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
