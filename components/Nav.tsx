"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { useFocusTrap } from "@/lib/useFocusTrap";

const ANCHOR_LINKS = [
  { label: "Our Story", href: "#about" },
  { label: "The Garden", href: "#garden" },
  { label: "Ales", href: "#ales" },
  { label: "Find Us", href: "#find-us" },
];

const HORIZONTAL_PANELS: Record<string, number> = {
  "#food": 0,
  "#garden": 1,
  "#about": 2,
};


function scrollToSection(href: string) {
  // Panel links — delegate entirely to HorizontalFlow's API so it handles
  // its own lock state. Works whether the section is active or not.
  if (href in HORIZONTAL_PANELS && window.innerWidth >= 1100) {
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
  const menuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useFocusTrap(menuRef, menuOpen, () => setMenuOpen(false));

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1100) setMenuOpen(false); };
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
          scrolled ? "bg-ochre/95 backdrop-blur-md shadow-[0_1px_0_rgba(14,14,13,0.10)]" : ""
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        <div className="mx-auto px-5 md:px-8 lg:px-14 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <a href="/" aria-label="The Marsh Harrier — home" className="focus-visible:outline-ochre">
            <Image
              src="/images/Marsh-harrier-logo.webp"
              alt="The Marsh Harrier"
              width={80}
              height={104}
              className="h-20 w-auto"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden nav:flex items-center gap-5 lg:gap-8">
            {ANCHOR_LINKS.map((link) => (
              <a
                key={link.href}
                href={anchorHref(link.href)}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className={`nav-link font-sans text-xs tracking-widest uppercase transition-colors duration-200 cursor-pointer ${scrolled ? "text-ink/70 hover:text-ink" : "text-parchment-light/60 hover:text-parchment-light"}`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/rooms"
              className={`nav-link font-sans text-xs tracking-widest uppercase transition-colors duration-200 ${
                scrolled
                  ? pathname === "/rooms" ? "text-ink font-medium" : "text-ink/70 hover:text-ink"
                  : pathname === "/rooms" ? "text-parchment-light" : "text-parchment-light/60 hover:text-parchment-light"
              }`}
            >
              Rooms
            </a>
            <a
              href="/events"
              className={`nav-link font-sans text-xs tracking-widest uppercase transition-colors duration-200 ${
                scrolled
                  ? pathname === "/events" ? "text-ink font-medium" : "text-ink/70 hover:text-ink"
                  : pathname === "/events" ? "text-parchment-light" : "text-parchment-light/60 hover:text-parchment-light"
              }`}
            >
              Events
            </a>
            <a
              href={anchorHref("#food")}
              onClick={(e) => handleAnchorClick(e, "#food")}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-2.5 border transition-colors duration-300 focus-visible:outline-ochre cursor-pointer ${
                scrolled
                  ? "border-ink/30 text-ink hover:border-ink/60"
                  : "border-parchment-light/40 text-parchment-light/70 hover:border-parchment-light/70 hover:text-parchment-light"
              }`}
            >
              View Menu
            </a>
            {/* TODO: replace href with your booking system URL (OpenTable, ResDiary, etc.) */}
            <a
              href={anchorHref("#find-us")}
              onClick={(e) => handleAnchorClick(e, "#find-us")}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-2.5 transition-colors duration-300 focus-visible:outline-ochre cursor-pointer ${
                scrolled
                  ? "bg-parchment text-ink hover:bg-parchment-dark"
                  : "bg-ochre text-parchment-light hover:bg-ochre-light"
              }`}
            >
              Book a Table
            </a>
          </nav>

          {/* Mobile menu toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="nav:hidden p-2 flex flex-col gap-[5px] focus-visible:outline-ochre"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block h-px w-6 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : ""} ${scrolled ? "bg-ink" : "bg-parchment-light"}`} />
            <span className={`block h-px w-6 transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""} ${scrolled ? "bg-ink" : "bg-parchment-light"}`} />
            <span className={`block h-px w-6 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""} ${scrolled ? "bg-ink" : "bg-parchment-light"}`} />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <motion.div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        className="fixed inset-0 z-40 bg-ochre flex flex-col justify-center px-8 nav:hidden overflow-hidden"
        initial={false}
        animate={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] font-serif text-[50vw] leading-none text-parchment/20 select-none pointer-events-none"
          aria-hidden="true"
        >
          &amp;
        </div>
        <nav aria-label="Mobile navigation links" className="flex flex-col gap-5 sm:gap-8 relative z-10">
          {ANCHOR_LINKS.map((link, i) => (
            <motion.a
              key={link.href}
              href={anchorHref(link.href)}
              onClick={(e) => handleMobileAnchorClick(e, link.href)}
              className="font-serif text-parchment text-3xl sm:text-4xl hover:text-ink transition-colors cursor-pointer"
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
            className={`font-serif text-3xl sm:text-4xl transition-colors cursor-pointer ${
              pathname === "/rooms" ? "text-ink font-medium" : "text-parchment hover:text-ink"
            }`}
            initial={{ x: -24, opacity: 0 }}
            animate={menuOpen ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
            transition={{ delay: ANCHOR_LINKS.length * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Rooms
          </motion.a>
          <motion.a
            href="/events"
            onClick={() => setMenuOpen(false)}
            className={`font-serif text-3xl sm:text-4xl transition-colors cursor-pointer ${
              pathname === "/events" ? "text-ink font-medium" : "text-parchment hover:text-ink"
            }`}
            initial={{ x: -24, opacity: 0 }}
            animate={menuOpen ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
            transition={{ delay: (ANCHOR_LINKS.length + 1) * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Events
          </motion.a>
          <motion.div
            className="mt-2 flex gap-3"
            initial={{ x: -24, opacity: 0 }}
            animate={menuOpen ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
            transition={{ delay: (ANCHOR_LINKS.length + 1) * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href={anchorHref("#food")}
              onClick={(e) => handleMobileAnchorClick(e, "#food")}
              className="font-sans text-xs tracking-widest uppercase px-6 py-3 border border-parchment/50 text-parchment hover:bg-parchment/10 transition-colors cursor-pointer"
            >
              View Menu
            </a>
            <a
              href={anchorHref("#find-us")}
              onClick={(e) => handleMobileAnchorClick(e, "#find-us")}
              className="font-sans text-xs tracking-widest uppercase px-6 py-3 bg-parchment text-ink hover:bg-parchment-dark transition-colors cursor-pointer"
            >
              Book a Table
            </a>
          </motion.div>
        </nav>
      </motion.div>
    </>
  );
}
