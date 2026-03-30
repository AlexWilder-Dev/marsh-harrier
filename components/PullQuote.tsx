"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function PullQuote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      className="relative bg-forest-deep min-h-screen flex items-center py-32 overflow-hidden"
      aria-label="Quote"
    >
      {/* Radial glow — right-weighted to balance the asymmetric layout */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_50%,rgba(184,137,42,0.07),transparent)]"
        aria-hidden="true"
      />

      {/* Drifting rule line */}
      <motion.div
        className="absolute left-0 right-0 top-[38%] h-px bg-gradient-to-r from-transparent via-ochre/10 to-transparent"
        style={{ y }}
        aria-hidden="true"
      />

      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ochre/30 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 w-full">
        {/* Enormous quote mark bleeding off left edge */}
        <motion.div
          className="absolute left-0 top-0 font-serif leading-none select-none text-[45vw] md:text-[28vw] text-ochre/10 -translate-x-[12%] -translate-y-[15%] pointer-events-none"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          &ldquo;
        </motion.div>

        {/* Right-weighted blockquote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="ml-auto max-w-2xl"
        >
          <p className="font-serif font-light italic text-parchment-light text-display-lg leading-[0.94] text-balance mb-10">
            One of the best Sunday roasts in Oxford.
          </p>
          <footer className="flex items-center gap-4">
            <div className="w-px h-8 bg-ochre/50 flex-shrink-0" aria-hidden="true" />
            <cite className="font-sans not-italic text-ochre text-xs tracking-widest uppercase">
              An oasis of calm in busy Cowley
            </cite>
          </footer>
        </motion.blockquote>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ochre/30 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
