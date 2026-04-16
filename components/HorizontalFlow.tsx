"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const NUM_PANELS = 3;

// ─── Panels ─────────────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <article
      id="about"
      className="flex-shrink-0 w-full md:w-screen h-auto md:h-full flex flex-col md:flex-row"
      aria-label="About The Marsh Harrier"
    >
      <div className="flex-1 bg-parchment relative flex items-center px-8 md:px-16 lg:px-24 py-20 md:py-0 min-h-[60vh] md:min-h-0 overflow-hidden">
        {/* Large decorative ampersand — centred behind copy */}
        <div
          className="absolute left-1/2 -translate-x-1/4 top-1/2 -translate-y-1/2 font-serif text-[22vw] leading-none text-forest-deep/[0.055] select-none pointer-events-none"
          aria-hidden="true"
        >
          &amp;
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-6">Est. Cowley</p>
          <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9] mb-8">
            Unpretentious.
            <br />
            <em className="italic block ml-8">Genuinely good.</em>
          </h2>
          <p className="font-sans text-ink/65 text-base leading-relaxed font-light mb-4">
            The Marsh Harrier is a proper community local — not a gastro-pub experience,
            not a theme bar. Just a well-run, deeply loved neighbourhood pub that takes
            its ale seriously.
          </p>
          <p className="font-sans text-ink/65 text-base leading-relaxed font-light">
            We hold{" "}
            <strong className="font-medium text-forest-deep">Master Cellarman status</strong>
            {" "}— your pint will be perfectly kept, served at the right temperature,
            and taste exactly as the brewer intended.
          </p>
          {/* Double rule stack — Victorian printer's detail */}
          <div className="mt-10 flex items-start gap-4">
            <div className="flex flex-col gap-1 flex-shrink-0 mt-1">
              <div className="rule-ochre w-20" />
              <div className="rule-ochre w-10 opacity-40" />
            </div>
            <p className="font-sans text-ink/35 text-xs tracking-widest uppercase">
              Cowley · Oxford · OX4 2HH
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-[38%] h-64 md:h-full overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://marshharriercowley.co.uk/media/photo-crowd.jpg"
          alt="Regulars enjoying The Marsh Harrier"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
        {/* Ochre rule at right edge */}
        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-ochre/30 to-transparent hidden md:block" aria-hidden="true" />
      </div>
    </article>
  );
}

function GardenPanel() {
  return (
    <article
      id="garden"
      className="relative flex-shrink-0 w-full md:w-screen h-[75vw] md:h-full overflow-hidden"
      aria-label="The beer garden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://marshharriercowley.co.uk/media/photo-outside-front.jpg"
        alt="The Marsh Harrier beer garden — sunny and welcoming"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="lazy"
      />
      {/* Consistent midtone depth layer */}
      <div className="absolute inset-0 bg-forest-rich/20" aria-hidden="true" />
      {/* Tightened bottom gradient — sky breathes */}
      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-forest-deep/90 via-forest-deep/50 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/35 to-transparent" aria-hidden="true" />

      {/* Editorial date stamp — rotated top-right */}
      <p
        className="absolute top-10 right-10 font-sans text-[9px] tracking-widest uppercase text-parchment-light/30 rotate-90 origin-top-right hidden md:block"
        aria-hidden="true"
      >
        South-facing · Oxford
      </p>

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
        <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">The Garden</p>
        <h2 className="font-serif font-light text-parchment-light text-display-xl leading-[0.9] mb-6">
          Sun,
          <br />
          ale &amp;
          <br />
          <em className="italic">nowhere else to be.</em>
        </h2>
        <p className="font-sans text-parchment-light/65 text-base leading-relaxed font-light max-w-sm">
          Sheltered, south-facing, made for long summer evenings. One of
          Cowley&apos;s most cherished outdoor spaces.
        </p>
      </div>
    </article>
  );
}

function FoodPanel() {
  return (
    <article
      id="food"
      className="relative flex-shrink-0 w-full md:w-screen h-[75vw] md:h-full overflow-hidden"
      aria-label="Food and drink"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://marshharriercowley.co.uk/media/photo-food.jpg"
        alt="Food at The Marsh Harrier"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        loading="lazy"
      />
      {/* Midtone depth layer */}
      <div className="absolute inset-0 bg-forest-rich/25" aria-hidden="true" />
      {/* Tightened bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-forest-deep/95 via-forest-deep/55 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/45 to-transparent" aria-hidden="true" />

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
        <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">Food &amp; Drink</p>
        <h2 className="font-serif font-light text-parchment-light text-display-xl leading-[0.9] mb-8">
          Proper food,
          <br />
          <em className="italic">done</em>
          <br />
          properly.
        </h2>
        {/* Arrow-rule menu links */}
        <div className="flex flex-col gap-0 max-w-xs">
          {[
            { title: "Food Menu", href: "https://marshharriercowley.co.uk/media/food-menu.pdf" },
            { title: "Drinks Menu", href: "https://marshharriercowley.co.uk/media/drinks-menu.pdf" },
          ].map((m) => (
            <a
              key={m.title}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center py-3 border-t border-parchment-light/15 hover:border-ochre/50 transition-colors duration-300 focus-visible:outline-ochre"
              aria-label={`Download ${m.title} PDF (opens in new tab)`}
            >
              <span className="font-sans text-xs tracking-widest uppercase text-parchment-light/70 group-hover:text-parchment-light transition-colors duration-300 flex-shrink-0">
                {m.title}
              </span>
              <span
                className="flex-1 mx-3 h-px bg-parchment-light/20 group-hover:bg-ochre/50 transition-colors duration-300"
                aria-hidden="true"
              />
              <span className="font-sans text-parchment-light/50 group-hover:text-ochre transition-colors duration-300" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

// ─── Progress dots (desktop, right-anchored) ────────────────────────────────

function ProgressDots({ active }: { active: number }) {
  return (
    <div
      className="hidden md:flex absolute bottom-8 right-12 z-30 gap-2 items-center"
      role="tablist"
      aria-label="Section progress"
    >
      {Array.from({ length: NUM_PANELS }).map((_, i) => (
        <div
          key={i}
          role="tab"
          aria-selected={active === i}
          aria-label={`Panel ${i + 1} of ${NUM_PANELS}`}
          className={`rounded-full transition-all duration-500 ${
            active === i ? "w-6 h-1.5 bg-ochre" : "w-1.5 h-1.5 bg-parchment-light/30"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function HorizontalFlow() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const isActive = useRef(false);
  const isAnimating = useRef(false);
  const exitCooldown = useRef(false);

  // exitSection — called when threshold is met at the first or last panel.
  // Sets isActive false first so the wheel handler stops blocking immediately,
  // then hands control back to Lenis and scrolls past the section.
  const exitSection = useCallback((direction: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    isActive.current = false;
    exitCooldown.current = true;
    setTimeout(() => { exitCooldown.current = false; }, 1500);

    const lenis = window.__lenis;
    if (lenis) lenis.start();

    const sectionTop = wrapper.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = wrapper.offsetHeight;

    if (direction > 0) {
      const target = sectionTop + sectionHeight + 1;
      if (lenis) lenis.scrollTo(target, { duration: 0.8 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      const target = Math.max(0, sectionTop - 1);
      if (lenis) lenis.scrollTo(target, { duration: 0.8 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    }
  }, []);

  // IntersectionObserver — activate when section fills the viewport.
  // Snaps scroll to section top, locks Lenis, sets initial panel.
  // exitCooldown prevents re-activation during the exit scroll animation.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (window.innerWidth < 768) return;
        if (exitCooldown.current) return;
        if (!entry.isIntersecting || entry.intersectionRatio < 0.98) return;
        if (isActive.current) return;

        const lenis = window.__lenis;
        const sectionTop = wrapper.getBoundingClientRect().top + window.scrollY;

        // Snap scroll precisely to section top before locking
        if (lenis) lenis.scrollTo(sectionTop, { immediate: true });
        else window.scrollTo({ top: sectionTop });

        // entry.boundingClientRect.top >= 0 → section approaching from below (scroll down)
        const enteringFromTop = entry.boundingClientRect.top >= -10;
        setPanelIndex(enteringFromTop ? 0 : NUM_PANELS - 1);
        isActive.current = true;
        if (lenis) lenis.stop();
      },
      { threshold: [0.98, 1.0] }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Wheel handler — only active while isActive is true.
  // Accumulates delta until threshold met, then advances panel or exits.
  useEffect(() => {
    let wheelDelta = 0;
    let resetTimer: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return;
      if (!isActive.current) return;

      e.preventDefault();
      if (isAnimating.current) return;

      wheelDelta += e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { wheelDelta = 0; }, 600);

      if (Math.abs(wheelDelta) < 220) return;

      const direction = wheelDelta > 0 ? 1 : -1;
      wheelDelta = 0;

      setPanelIndex((current) => {
        const next = current + direction;
        if (next < 0 || next >= NUM_PANELS) {
          exitSection(direction);
          return current;
        }
        isAnimating.current = true;
        return next;
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(resetTimer);
    };
  }, [exitSection]);

  return (
    <section aria-label="About, Garden and Food sections">
      <div
        ref={wrapperRef}
        data-horizontal-flow
        className="overflow-hidden h-auto md:h-screen"
      >
        <motion.div
          className="flex flex-col md:flex-row md:w-[300vw] h-auto md:h-full"
          animate={{
            x: typeof window !== "undefined" ? -panelIndex * window.innerWidth : 0,
          }}
          transition={{ duration: 0.55, ease: [0.32, 0, 0.67, 0] }}
          onAnimationStart={() => { isAnimating.current = true; }}
          onAnimationComplete={() => { isAnimating.current = false; }}
        >
          <AboutPanel />
          <GardenPanel />
          <FoodPanel />
        </motion.div>

        <ProgressDots active={panelIndex} />
      </div>
    </section>
  );
}
