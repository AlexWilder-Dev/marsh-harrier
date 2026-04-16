"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll } from "framer-motion";

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
  const x = useMotionValue(0);
  const [activePanel, setActivePanel] = useState(0);
  const isSnapping = useRef(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Effect 1 — Drive x and active dot from scroll position. Pure, no Lenis interaction.
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (window.innerWidth < 768) { x.set(0); return; }
      x.set(-v * (NUM_PANELS - 1) * window.innerWidth);
      setActivePanel(Math.min(NUM_PANELS - 1, Math.round(v * (NUM_PANELS - 1))));
    });
  }, [scrollYProgress, x]);

  // Effect 2 — Wheel intercept: advance one panel per deliberate gesture.
  // data-lenis-prevent-wheel on the wrapper makes Lenis return early (no scroll update)
  // for any wheel event that passes through this element. We become sole scroll controller.
  useEffect(() => {
    let wheelDelta = 0;
    let resetTimer: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      if (!wrapperRef.current || window.innerWidth < 768) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const inStickyZone = rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
      if (!inStickyZone) return;

      // We own all wheel events in this zone — block native scroll unconditionally.
      // Lenis is already blocked by data-lenis-prevent-wheel on the wrapper.
      e.preventDefault();

      if (isSnapping.current) return;

      const currentPanel = Math.round(scrollYProgress.get() * (NUM_PANELS - 1));

      wheelDelta += e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { wheelDelta = 0; }, 600);

      if (Math.abs(wheelDelta) < 220) return;

      const direction = wheelDelta > 0 ? 1 : -1;
      wheelDelta = 0;

      const wrapper = wrapperRef.current;
      const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;

      isSnapping.current = true;
      setTimeout(() => { isSnapping.current = false; }, 1100);

      const lenis = window.__lenis;

      // Boundary exits — must land outside the sticky zone so inStickyZone is false
      // on the next wheel event. scrollableHeight puts rect.bottom === innerHeight
      // (still in zone). +/-10px ensures rect.bottom < innerHeight-2 (or rect.top > 2).
      if (direction > 0 && currentPanel >= NUM_PANELS - 1) {
        const target = wrapperTop + scrollableHeight + 10;
        if (lenis) lenis.scrollTo(target, { duration: 1.0 });
        else window.scrollTo({ top: target, behavior: "smooth" });
        return;
      }
      if (direction < 0 && currentPanel <= 0) {
        const target = wrapperTop - 10;
        if (lenis) lenis.scrollTo(target, { duration: 1.0 });
        else window.scrollTo({ top: target, behavior: "smooth" });
        return;
      }

      // Snap to adjacent panel
      const targetPanel = currentPanel + direction;
      const targetY = wrapperTop + (targetPanel / (NUM_PANELS - 1)) * scrollableHeight;
      if (lenis) lenis.scrollTo(targetY, { duration: 0.9 });
      else window.scrollTo({ top: targetY, behavior: "smooth" });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(resetTimer);
    };
  }, [scrollYProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 3 — Keep x in sync after resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { x.set(0); return; }
      x.set(-scrollYProgress.get() * (NUM_PANELS - 1) * window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [x, scrollYProgress]);

  return (
    <section aria-label="About, Garden and Food sections">
      <div ref={wrapperRef} data-horizontal-flow data-lenis-prevent-wheel className="relative md:h-[300vh]">
        <div className="overflow-hidden relative md:sticky md:top-0 md:h-screen">
          <motion.div
            className="flex flex-col md:flex-row md:w-[300vw] h-auto md:h-full"
            style={{ x }}
          >
            <AboutPanel />
            <GardenPanel />
            <FoodPanel />
          </motion.div>

          <ProgressDots active={activePanel} />
        </div>
      </div>
    </section>
  );
}
