import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0C12",
        foreground: "#F1F5F9",
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5A0FF",
          400: "#7772FF",
          500: "#514BFA",
          600: "#4338CA",
          700: "#3730A3",
          800: "#1E1B4B",
          900: "#121422",
          950: "#0B0C12",
        },
      },
    },
  },
  plugins: [],
};

export default config;
