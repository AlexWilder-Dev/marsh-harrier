import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "rgb(var(--color-parchment) / <alpha-value>)",
          light:   "rgb(var(--color-parchment-light) / <alpha-value>)",
          dark:    "rgb(var(--color-parchment-dark) / <alpha-value>)",
        },
        forest: {
          deep:  "rgb(var(--color-forest-deep) / <alpha-value>)",
          rich:  "rgb(var(--color-forest-rich) / <alpha-value>)",
          mid:   "rgb(var(--color-forest-mid) / <alpha-value>)",
          light: "rgb(var(--color-forest-light) / <alpha-value>)",
        },
        ochre: {
          DEFAULT: "rgb(var(--color-ochre) / <alpha-value>)",
          light:   "rgb(var(--color-ochre-light) / <alpha-value>)",
          warm:    "rgb(var(--color-ochre-warm) / <alpha-value>)",
        },
        ink:    "rgb(var(--color-ink) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      height: {
        dvh: "100dvh",
      },
      minHeight: {
        dvh: "100dvh",
      },
      screens: {
        nav: "1100px",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:  ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs:  ["1.0625rem", { lineHeight: "1.4" }],
        sm:  ["1.1875rem", { lineHeight: "1.5" }],
        "display-3xl": ["clamp(2.5rem, 13vw, 13rem)", { lineHeight: "0.85", letterSpacing: "-0.03em" }],
        "display-2xl": ["clamp(4rem, 11vw, 11rem)",   { lineHeight: "0.88", letterSpacing: "-0.02em" }],
        "display-xl":  ["clamp(2.5rem, 8vw, 8rem)",   { lineHeight: "0.9",  letterSpacing: "-0.02em" }],
        "display-lg":  ["clamp(2.5rem, 6vw, 6rem)",   { lineHeight: "0.94", letterSpacing: "-0.01em" }],
        "display-md":  ["clamp(2rem, 4vw, 4rem)",     { lineHeight: "1.0",  letterSpacing: "-0.01em" }],
        "display-sm":  ["clamp(1.5rem, 2.5vw, 2.5rem)", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};

export default config;
