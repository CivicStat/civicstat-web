import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        ink: "#0E1116",
        mist: "#F7F8FA",
        moss: "#0F5B4D",
        "moss-hover": "#0D4F43",
        clay: "#C9B59E",
        surface: "#FFFFFF",
        "surface-sub": "#EEF1F5",
        "surface-sub2": "#E4E8EE",
        border: "#DDE1E8",
        "border-subtle": "#EEF1F5",
        "text-secondary": "#4A5468",
        "text-tertiary": "#8B95A8",
        "bar-voor": "#2D3648",
        "bar-tegen": "#C5CBD6",
        "bar-afwezig": "#EEF1F5",
        "accent-subtle": "#E8F5F0",
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(14,17,22,0.06)",
        "card-md": "0 4px 12px rgba(14,17,22,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
