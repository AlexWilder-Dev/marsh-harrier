"use client";

/**
 * HorizontalFlow — horizontal scroll section (About → Garden → Food)
 *
 * Architecture:
 * - An IntersectionObserver watches the wrapper div. When it's fully in the
 *   viewport, `isActive` is set and wheel/touch events are intercepted to
 *   drive horizontal panel navigation instead of vertical page scroll.
 * - Lenis (window.__lenis) is stopped while the horizontal lock is active and
 *   restarted when the user scrolls past the last panel or back past the first.
 *   If Lenis is removed or renamed, this component will break — the lock relies
 *   on lenis.stop() / lenis.start() to suppress the native smooth scroll.
 * - window.__horizontalFlow is a small API exposed so Nav.tsx can trigger panel
 *   navigation from outside this component (e.g. clicking "Food & Drink" in the
 *   nav jumps directly to panel 2). This is intentional global state — the
 *   alternative (prop drilling or context) would require Nav to be a child of
 *   this component, which it isn't.
 * - Do not add CSS transitions to the panel container's transform — the position
 *   is driven frame-by-frame by Framer Motion's useMotionValue for performance.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    __horizontalFlow?: {
      navigate: (panelIndex: number) => void;
      release: () => void;
    };
  }
}

const NUM_PANELS = 3;

// ─── Panels ─────────────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <article
      id="about"
      className="flex-shrink-0 w-screen h-full flex flex-col-reverse md:flex-row"
      aria-label="About The Marsh Harrier"
    >
      {/* Text content — scrollable on mobile if needed */}
      <div className="flex-1 bg-parchment relative flex items-start md:items-center overflow-y-auto md:overflow-hidden px-6 sm:px-8 md:px-16 lg:px-24 py-8 md:py-0">
        <div
          className="hidden md:block absolute left-1/2 -translate-x-1/4 top-1/2 -translate-y-1/2 font-serif text-[22vw] leading-none text-forest-deep/[0.055] select-none pointer-events-none"
          aria-hidden="true"
        >
          &amp;
        </div>

        <div className="relative z-10 max-w-md w-full">
          <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4 md:mb-6">Est. Cowley</p>
          <h2 className="font-serif font-light text-2xl sm:text-display-xl text-forest-deep leading-[0.9] mb-6 md:mb-8">
            Unpretentious.
            <br />
            <em className="italic block ml-6 sm:ml-8">Genuinely good.</em>
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
          <div className="mt-8 flex items-start gap-4">
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

      {/* Image — top portion on mobile, right column on desktop */}
      <div className="relative w-full md:w-[38%] h-[38%] md:h-full overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/marsh-harrier-pub-sign-beautiful.webp"
          alt="The Marsh Harrier pub sign"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-ochre/30 to-transparent hidden md:block" aria-hidden="true" />
      </div>
    </article>
  );
}

function GardenPanel() {
  return (
    <article
      id="garden"
      className="relative flex-shrink-0 w-screen h-full overflow-hidden"
      aria-label="The beer garden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/marsh-harrier-pub-outdoor-garden.webp"
        alt="The Marsh Harrier beer garden"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-forest-rich/20" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-forest-deep/90 via-forest-deep/50 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/35 to-transparent" aria-hidden="true" />

      <p
        className="absolute top-10 right-10 font-sans text-[9px] tracking-widest uppercase text-parchment-light/30 rotate-90 origin-top-right hidden md:block"
        aria-hidden="true"
      >
        South-facing · Oxford
      </p>

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-16 lg:p-24">
        <p className="font-sans text-parchment-light text-xs tracking-widest uppercase mb-4 md:mb-5">The Garden</p>
        <h2 className="font-serif font-light text-parchment-light text-display-xl leading-[0.9] mb-5 md:mb-6">
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
      className="relative flex-shrink-0 w-screen h-full overflow-hidden"
      aria-label="Food and drink"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/marsh-harrier-oxford-burger-most-delicious.jpeg"
        alt="Food at The Marsh Harrier"
        className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-forest-rich/25" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-forest-deep/95 via-forest-deep/55 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/45 to-transparent" aria-hidden="true" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-16 lg:p-24">
        <p className="font-sans text-parchment-light text-xs tracking-widest uppercase mb-4 md:mb-5">Food &amp; Drink</p>
        <h2 className="font-serif font-light text-parchment-light text-display-xl leading-[0.9] mb-6 md:mb-8">
          Proper food,
          <br />
          <em className="italic">done</em>
          <br />
          properly.
        </h2>
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-16">
          <div className="flex flex-col gap-0 max-w-xs">
            {[
              { title: "Food Menu", href: "/media/food-menu.pdf" },
              { title: "Drinks Menu", href: "/media/drinks-menu.pdf" },
              { title: "BBQ Menu", href: "/media/bbq-menu.pdf" },
              { title: "Buffet Menu", href: "/media/buffet-menu.pdf" },
              { title: "Christmas Menu", href: "/media/christmas-menu-2025.pdf" },
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
                <span className="flex-1 mx-3 h-px bg-parchment-light/20 group-hover:bg-ochre/50 transition-colors duration-300" aria-hidden="true" />
                <span className="font-sans text-parchment-light/50 group-hover:text-ochre transition-colors duration-300" aria-hidden="true">→</span>
              </a>
            ))}
          </div>

          <div className="border-t border-parchment-light/15 pt-4 md:border-t-0 md:pt-0 md:border-l md:border-parchment-light/15 md:pl-12">
            <p className="font-sans text-parchment-light text-[15px] tracking-widest uppercase mb-2">Order for collection</p>
            <a
              href="/order?type=takeaway"
              className="inline-flex items-center gap-3 font-sans text-xs tracking-widest uppercase text-parchment-light hover:text-ochre transition-colors duration-300 focus-visible:outline-ochre"
            >
              Order online
              <span className="w-6 h-px bg-current transition-all duration-300" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Progress dots ───────────────────────────────────────────────────────────

function ProgressDots({ active }: { active: number }) {
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:left-auto md:right-12 md:translate-x-0 z-30 flex gap-2 items-center"
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
  const panelIndexRef = useRef(0);
  const isActive = useRef(false);
  const isAnimating = useRef(false);
  const exitCooldown = useRef(false);
  const pendingPanel = useRef<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => { setWindowWidth(window.innerWidth); }, []);

  panelIndexRef.current = panelIndex;

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

  // Touch swipe — horizontal only; vertical movement cancels the swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || isAnimating.current) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only fire if horizontal movement clearly dominates and exceeds threshold
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const direction = dx > 0 ? 1 : -1;
    const next = panelIndexRef.current + direction;
    if (next >= 0 && next < NUM_PANELS) {
      isAnimating.current = true;
      setPanelIndex(next);
    }
  }, []);

  // IntersectionObserver — desktop scroll-lock activation
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

        if (lenis) lenis.scrollTo(sectionTop, { immediate: true });
        else window.scrollTo({ top: sectionTop });

        const enteringFromTop = entry.boundingClientRect.top >= -10;
        const target = pendingPanel.current !== null
          ? pendingPanel.current
          : (enteringFromTop ? 0 : NUM_PANELS - 1);
        pendingPanel.current = null;
        setPanelIndex(target);
        isActive.current = true;
        if (lenis) lenis.stop();
      },
      { threshold: [0.98, 1.0] }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Global API for Nav
  useEffect(() => {
    window.__horizontalFlow = {
      navigate: (index: number) => {
        if (isActive.current) {
          setPanelIndex(index);
          return;
        }
        pendingPanel.current = index;
        const lenis = window.__lenis;
        if (lenis) lenis.start();
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const sectionTop = wrapper.getBoundingClientRect().top + window.scrollY;
        if (lenis) lenis.scrollTo(sectionTop, { duration: 1.2 });
        else window.scrollTo({ top: sectionTop, behavior: "smooth" });
      },
      release: () => {
        if (!isActive.current) return;
        isActive.current = false;
        exitCooldown.current = true;
        setTimeout(() => { exitCooldown.current = false; }, 2000);
        const lenis = window.__lenis;
        if (lenis) lenis.start();
      },
    };
    return () => { delete window.__horizontalFlow; };
  }, []);

  // Wheel handler — desktop only
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

      const current = panelIndexRef.current;
      const next = current + direction;

      if (next < 0 || next >= NUM_PANELS) {
        exitSection(direction);
      } else {
        isAnimating.current = true;
        setPanelIndex(next);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(resetTimer);
    };
  }, [exitSection]);

  // Resize — update windowWidth on all screen sizes
  useEffect(() => {
    const handleResize = () => { setWindowWidth(window.innerWidth); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section aria-label="About, Garden and Food sections">

      {/* ── Mobile: stacked vertical sections (hidden on md+) ───────────────── */}
      <div className="md:hidden">

        {/* About */}
        <div id="about" className="bg-parchment">
          <div className="relative h-[60vw] min-h-[200px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/marsh-harrier-pub-sign-beautiful.webp"
              alt="The Marsh Harrier pub sign"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div className="px-6 py-10">
            <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4">Est. Cowley</p>
            <h2 className="font-serif font-light text-2xl text-forest-deep leading-[0.9] mb-5">
              Unpretentious.
              <br />
              <em className="italic block ml-6">Genuinely good.</em>
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
            <div className="flex items-start gap-4 mt-8">
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

        {/* Garden */}
        <div id="garden" className="relative h-[72vw] min-h-[280px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/marsh-harrier-pub-outdoor-garden.webp"
            alt="The Marsh Harrier beer garden"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-forest-rich/20" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-forest-deep/90 via-forest-deep/50 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/30 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-sans text-parchment-light text-xs tracking-widest uppercase mb-3">The Garden</p>
            <h2 className="font-serif font-light text-parchment-light text-3xl leading-[0.9] mb-3">
              Sun, ale &amp;
              <br />
              <em className="italic">nowhere else to be.</em>
            </h2>
            <p className="font-sans text-parchment-light/65 text-sm leading-relaxed font-light">
              Sheltered, south-facing, made for long summer evenings.
            </p>
          </div>
        </div>

        {/* Food */}
        <div id="food" className="relative h-[72vw] min-h-[280px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/marsh-harrier-oxford-burger-most-delicious.jpeg"
            alt="Food at The Marsh Harrier"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-forest-rich/25" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-forest-deep/95 via-forest-deep/55 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/40 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-sans text-parchment-light text-xs tracking-widest uppercase mb-3">Food &amp; Drink</p>
            <h2 className="font-serif font-light text-parchment-light text-3xl leading-[0.9] mb-3">
              Proper food,
              <br />
              <em className="italic">done</em> properly.
            </h2>
          </div>
        </div>
        {/* Food menu links */}
        <div className="bg-forest-deep px-6 py-8 flex flex-col gap-0">
          {[
            { title: "Food Menu", href: "/media/food-menu.pdf" },
            { title: "Drinks Menu", href: "/media/drinks-menu.pdf" },
            { title: "BBQ Menu", href: "/media/bbq-menu.pdf" },
            { title: "Buffet Menu", href: "/media/buffet-menu.pdf" },
            { title: "Christmas Menu", href: "/media/christmas-menu-2025.pdf" },
          ].map((m) => (
            <a
              key={m.title}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center py-3 border-t border-parchment-light/15 hover:border-ochre/50 transition-colors duration-300"
              aria-label={`Download ${m.title} PDF (opens in new tab)`}
            >
              <span className="font-sans text-xs tracking-widest uppercase text-parchment-light/70 group-hover:text-parchment-light transition-colors duration-300">
                {m.title}
              </span>
              <span className="flex-1 mx-3 h-px bg-parchment-light/20 group-hover:bg-ochre/50 transition-colors duration-300" aria-hidden="true" />
              <span className="font-sans text-parchment-light/50 group-hover:text-ochre transition-colors duration-300" aria-hidden="true">→</span>
            </a>
          ))}
        </div>

      </div>
      {/* ── End mobile ──────────────────────────────────────────────────────── */}

      {/* ── Desktop: horizontal scroll (hidden on mobile) ───────────────────── */}
      <div
        ref={wrapperRef}
        data-horizontal-flow
        className="relative overflow-hidden h-dvh hidden md:block"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex flex-row w-[300vw] h-full"
          animate={{ x: -panelIndex * windowWidth }}
          transition={{ duration: 0.55, ease: [0.32, 0, 0.67, 0] }}
          onAnimationComplete={() => { isAnimating.current = false; }}
        >
          <AboutPanel />
          <GardenPanel />
          <FoodPanel />
        </motion.div>

        <ProgressDots active={panelIndex} />
      </div>
      {/* ── End desktop ─────────────────────────────────────────────────────── */}

    </section>
  );
}
