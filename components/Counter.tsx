"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface CounterProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function Counter({
  to,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: CounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isInView) return;

    // Skip animation for users who prefer reduced motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(to);
      return;
    }

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOutExpo(progress) * to));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isInView, to, duration]);

  return (
    // aria-label on the parent element gives screen readers the final value
    // without reading intermediate numbers
    <span
      ref={ref}
      className={className}
      aria-label={`${prefix}${to}${suffix}`}
    >
      {prefix}{value}{suffix}
    </span>
  );
}
