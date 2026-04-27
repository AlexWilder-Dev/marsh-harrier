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
          DEFAULT: "#F5F1EA",   /* warm ivory — main backgrounds */
          light: "#FFFFFF",     /* pure white — cards, elevated surfaces */
          dark: "#EDE7DC",      /* deeper cream — section alternates, nav */
        },
        forest: {
          deep: "#1A1A1A",      /* near-black — headers, nav, dark sections */
          rich: "#2D2D2D",      /* slightly lifted — hover states */
          mid: "#7A8068",       /* muted olive-sage — secondary accents */
          light: "#8A8378",     /* taupe-grey — muted text, meta */
        },
        ochre: {
          DEFAULT: "#7E8A4A",   /* muted olive — CTAs, highlights */
          light: "#929E59",     /* lighter olive — hover */
          warm: "#6B2C2C",      /* restrained burgundy — sale/alert use */
        },
        ink: "#1A1A1A",
        border: "#D9D2C5",
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
