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
