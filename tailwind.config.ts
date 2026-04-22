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
          DEFAULT: "#c8d5c0",
          light: "#dce6d8",
          dark: "#b0bfa9",
        },
        forest: {
          deep: "#1e2d3d",
          rich: "#253548",
          mid: "#3a5068",
          light: "#4d6880",
        },
        ochre: {
          DEFAULT: "#4a5f27",
          light: "#5c7530",
          warm: "#3a4d1f",
        },
        ink: "#1e2d3d",
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
