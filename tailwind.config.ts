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
          DEFAULT: "#F0E8D6",
          light: "#F8F3E8",
          dark: "#DDD0B8",
        },
        forest: {
          deep: "#0C1A10",
          rich: "#1A3325",
          mid: "#2E5240",
          light: "#4A7260",
        },
        ochre: {
          DEFAULT: "#B8892A",
          light: "#CFA040",
          warm: "#8C6420",
        },
        ink: "#1C1408",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
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
