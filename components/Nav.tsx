"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

const ANCHOR_LINKS = [
  { label: "Our Story", href: "#about" },
  { label: "The Garden", href: "#garden" },
  { label: "Ales", href: "#ales" },
  { label: "Find Us", href: "#find-us" },
];

const HORIZONTAL_PANELS: Record<string, number> = {
  "#about": 0,
  "#garden": 1,
  "#food": 2,
};
const HORIZONTAL_PANEL_COUNT = 3;

function scrollToSection(href: string) {
  // Panel links — delegate entirely to HorizontalFlow's API so it handles
  // its own lock state. Works whether the section is active or not.
  if (href in HORIZONTAL_PANELS && window.innerWidth >= 768) {
    window.__horizontalFlow?.navigate(HORIZONTAL_PANELS[href]);
    return;
  }

  // Non-panel links — release the section lock first (no-op if not active),
  // then scroll. This ensures Lenis is running before we call scrollTo.
  window.__horizontalFlow?.release();

  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(href, { duration: 1.4 });
  } else {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }
}

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // On the home page: smooth-scroll to section.
  // On other pages: navigate to /#anchor so the browser lands on the right section.
  function handleAnchorClick(e: React.MouseEvent, href: string) {
    if (isHome) {
      e.preventDefault();
      scrollToSection(href);
    }
    // else: let the default <a href="/#about"> navigate normally
  }

  function handleMobileAnchorClick(e: React.MouseEvent, href: string) {
    setMenuOpen(false);
    if (isHome) {
      e.preventDefault();
      setTimeout(() => scrollToSection(href), 300);
    }
  }

  const anchorHref = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <>
      <motion.header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-forest-rich/95 backdrop-blur-md shadow-[0_1px_0_rgba(184,137,42,0.15)]" : ""
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        <div className="mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between h-16 md:h-20">
          {/* Wordmark */}
          <a
            href="/"
            aria-label="The Marsh Harrier — home"
            className="font-serif text-parchment-light text-xl md:text-2xl leading-none tracking-tight focus-visible:outline-ochre"
          >
            The Marsh Harrier
          </a>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            {ANCHOR_LINKS.map((link) => (
              <a
                key={link.href}
                href={anchorHref(link.href)}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="nav-link font-sans text-xs tracking-widest uppercase text-parchment-light/60 hover:text-parchment-light transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/rooms"
              className={`nav-link font-sans text-xs tracking-widest uppercase text-parchment-light/60 hover:text-parchment-light transition-colors duration-200 ${
                pathname === "/rooms" ? "text-parchment-light" : ""
              }`}
            >
              Rooms
            </a>
            <a
              href={anchorHref("#food")}
              onClick={(e) => handleAnchorClick(e, "#food")}
              className="ml-2 font-sans text-xs tracking-widest uppercase px-5 py-2.5 bg-ochre text-parchment-light hover:bg-ochre-light transition-colors duration-300 focus-visible:outline-ochre cursor-pointer"
            >
              View Menu
            </a>
          </nav>

          {/* Mobile menu toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 flex flex-col gap-[5px] focus-visible:outline-ochre"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block h-px w-6 bg-parchment-light transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block h-px w-6 bg-parchment-light transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block h-px w-6 bg-parchment-light transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <motion.div
        id="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        className="fixed inset-0 z-40 bg-forest-deep flex flex-col justify-center px-8 md:hidden overflow-hidden"
        initial={false}
        animate={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] font-serif text-[50vw] leading-none text-forest-rich/40 select-none pointer-events-none"
          aria-hidden="true"
        >
          &amp;
        </div>
        <nav aria-label="Mobile navigation links" className="flex flex-col gap-8 relative z-10">
          {ANCHOR_LINKS.map((link, i) => (
            <motion.a
              key={link.href}
              href={anchorHref(link.href)}
              onClick={(e) => handleMobileAnchorClick(e, link.href)}
              className="font-serif text-parchment-light text-4xl hover:text-ochre transition-colors cursor-pointer"
              initial={{ x: -24, opacity: 0 }}
              animate={menuOpen ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {link.label}
            </motion.a>
          ))}
          <motion.a
            href="/rooms"
            onClick={() => setMenuOpen(false)}
            className={`font-serif text-4xl transition-colors cursor-pointer ${
              pathname === "/rooms" ? "text-ochre" : "text-parchment-light hover:text-ochre"
            }`}
            initial={{ x: -24, opacity: 0 }}
            animate={menuOpen ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
            transition={{ delay: ANCHOR_LINKS.length * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Rooms
          </motion.a>
          <motion.a
            href={anchorHref("#food")}
            onClick={(e) => handleMobileAnchorClick(e, "#food")}
            className="mt-2 self-start font-sans text-xs tracking-widest uppercase px-6 py-3 bg-ochre text-parchment-light cursor-pointer"
            initial={{ x: -24, opacity: 0 }}
            animate={menuOpen ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
            transition={{ delay: (ANCHOR_LINKS.length + 1) * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            View Menu
          </motion.a>
        </nav>
      </motion.div>
    </>
  );
}
