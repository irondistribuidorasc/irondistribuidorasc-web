import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";
import colors from "tailwindcss/colors";

const config: Config = {
	darkMode: "class",
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				slate: colors.neutral,
				brand: {
					50: "#ffe5e6",
					100: "#ffccce",
					200: "#ff999e",
					300: "#ff666d",
					400: "#ff333d",
					500: "#DC0714", // Primary red
					600: "#b0060f",
					700: "#84040b",
					800: "#580308",
					900: "#2c0104",
				},
			},
			fontFamily: {
				sans: [
					"Inter",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
			},
			keyframes: {
				marquee: {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(-50%)" },
				},
				blob: {
					"0%": { transform: "translate(0px, 0px) scale(1)" },
					"33%": { transform: "translate(30px, -50px) scale(1.1)" },
					"66%": { transform: "translate(-20px, 20px) scale(0.9)" },
					"100%": { transform: "translate(0px, 0px) scale(1)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-20px)" },
				},
				shimmer: {
					"0%": { backgroundPosition: "200% 0" },
					"100%": { backgroundPosition: "-200% 0" },
				},
			},
			animation: {
				marquee: "marquee 25s linear infinite",
				blob: "blob 7s infinite",
				float: "float 6s ease-in-out infinite",
				shimmer: "shimmer 8s linear infinite",
			},
		},
	},
	plugins: [
		heroui({
			themes: {
				light: {
					colors: {
						primary: {
							50: "#ffe5e6",
							100: "#ffccce",
							200: "#ff999e",
							300: "#ff666d",
							400: "#ff333d",
							500: "#DC0714",
							600: "#b0060f",
							700: "#84040b",
							800: "#580308",
							900: "#2c0104",
							DEFAULT: "#DC0714",
							foreground: "#ffffff",
						},
						danger: {
							50: "#ffe5e6",
							100: "#ffccce",
							200: "#ff999e",
							300: "#ff666d",
							400: "#ff333d",
							500: "#DC0714",
							600: "#b0060f",
							700: "#84040b",
							800: "#580308",
							900: "#2c0104",
							DEFAULT: "#DC0714",
							foreground: "#ffffff",
						},
					},
				},
				dark: {
					colors: {
						primary: {
							50: "#ffe5e6",
							100: "#ffccce",
							200: "#ff999e",
							300: "#ff666d",
							400: "#ff333d",
							500: "#DC0714",
							600: "#b0060f",
							700: "#84040b",
							800: "#580308",
							900: "#2c0104",
							DEFAULT: "#DC0714",
							foreground: "#ffffff",
						},
						danger: {
							50: "#ffe5e6",
							100: "#ffccce",
							200: "#ff999e",
							300: "#ff666d",
							400: "#ff333d",
							500: "#DC0714",
							600: "#b0060f",
							700: "#84040b",
							800: "#580308",
							900: "#2c0104",
							DEFAULT: "#DC0714",
							foreground: "#ffffff",
						},
					},
				},
			},
		}),
	],
};

export default config;
