import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#F5F0E6",   /* main background */
          light: "#FFFFFF",     /* elevated surfaces */
          dark: "#EBE5D8",      /* alt sections, nav */
        },
        forest: {
          deep: "#0E0E0D",      /* near-black — headers, nav, dark sections */
          rich: "#1C1C1B",      /* hover states */
          mid: "#7E8A4A",       /* olive — mid accent */
          light: "#929E59",     /* lighter olive */
        },
        ochre: {
          DEFAULT: "#7E8A4A",   /* olive — CTAs, highlights, alt backgrounds */
          light: "#929E59",     /* hover */
          warm: "#6B2C2C",      /* burgundy — restrained use */
        },
        ink: "#0E0E0D",
        border: "#DDD7CA",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs:  ["1.0625rem", { lineHeight: "1.4" }],
        sm:  ["1.1875rem", { lineHeight: "1.5" }],
        "display-3xl": ["clamp(3rem, 13vw, 13rem)", { lineHeight: "0.85", letterSpacing: "-0.03em" }],
        "display-2xl": ["clamp(4rem, 11vw, 11rem)", { lineHeight: "0.88", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(3rem, 8vw, 8rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 6rem)", { lineHeight: "0.94", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(2rem, 4vw, 4rem)", { lineHeight: "1.0", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.5rem, 2.5vw, 2.5rem)", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};

export default config;
