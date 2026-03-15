import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:     "#E8A000",
        "gold-lt":"#F5BC30",
        dark:     "#111111",
        "dark-2": "#1a1a1a",
        "dark-3": "#222222",
      },
      fontFamily: {
        script: ["var(--font-dancing)", "cursive"],
        serif:  ["var(--font-baskerville)", "Georgia", "serif"],
        sans:   ["var(--font-opensans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
