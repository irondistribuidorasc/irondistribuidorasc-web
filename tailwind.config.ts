import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ffe5e4",
          100: "#ffc7c3",
          200: "#ffa4a0",
          300: "#ff807d",
          400: "#ff605f",
          500: "#e10600",
          600: "#c90500",
          700: "#a00403",
          800: "#780202",
          900: "#4f0000",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [heroui()],
};

export default config;
