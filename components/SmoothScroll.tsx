"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Expose lenis globally so Nav and HorizontalFlow can call scrollTo / snap
declare global {
  interface Window { __lenis?: Lenis; }
}

// Functional pages — skip Lenis so native sticky + touch scroll work correctly
const LENIS_SKIP = ["/order", "/admin"];

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skip = LENIS_SKIP.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (skip) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;

    let raf: number;
    function animate(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [skip]);

  return <>{children}</>;
}
