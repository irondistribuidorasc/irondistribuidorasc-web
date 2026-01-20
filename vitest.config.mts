import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(new URL(import.meta.url)));

export default defineConfig({
	resolve: {
		alias: {
			"@": projectRoot,
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		testTimeout: 10000,
		hookTimeout: 10000,
		pool: "forks",
		include: [
			"src/**/__tests__/**/*.{test,spec}.{ts,tsx}",
			"src/**/*.{test,spec}.{ts,tsx}",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			reportsDirectory: "./coverage",
			include: ["src/{lib,hooks,contexts,data}/**/*.{ts,tsx}"],
			exclude: [
				"**/*.d.ts",
				"**/__tests__/**",
				// Integrações (DB/Auth) ficam fora do gate de unit tests.
				"src/lib/auth.ts",
				"src/lib/prisma.ts",
				"src/lib/supabase.ts",
			],
			thresholds: {
				lines: 90,
				statements: 90,
				functions: 90,
				branches: 90,
			},
		},
	},
});
