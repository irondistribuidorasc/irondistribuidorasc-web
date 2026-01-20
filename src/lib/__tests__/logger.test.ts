import { describe, expect, it, vi } from "vitest";

import { logger } from "../logger";

describe("logger", () => {
	it("loga em JSON no production", () => {
		const original = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";

		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		logger.error("falha", { foo: "bar" });

		expect(spy).toHaveBeenCalledTimes(1);
		const payload = spy.mock.calls[0]?.[0];
		expect(typeof payload).toBe("string");
		expect(payload).toContain('"level":"error"');
		expect(payload).toContain('"message":"falha"');
		expect(payload).toContain('"foo":"bar"');

		spy.mockRestore();
		process.env.NODE_ENV = original;
	});

	it("loga em formato legível fora de production", () => {
		const original = process.env.NODE_ENV;
		process.env.NODE_ENV = "test";

		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		logger.warn("atenção");
		expect(warn).toHaveBeenCalledTimes(1);
		expect(String(warn.mock.calls[0]?.[0])).toContain("WARN");
		expect(String(warn.mock.calls[0]?.[0])).toContain("atenção");
		warn.mockRestore();

		process.env.NODE_ENV = original;
	});

	it("debug só loga em development", () => {
		const original = process.env.NODE_ENV;

		const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
		process.env.NODE_ENV = "test";
		logger.debug("x");
		expect(debug).not.toHaveBeenCalled();

		process.env.NODE_ENV = "development";
		logger.debug("y", { a: 1 });
		expect(debug).toHaveBeenCalledTimes(1);
		expect(String(debug.mock.calls[0]?.[0])).toContain("DEBUG");
		expect(String(debug.mock.calls[0]?.[0])).toContain('"a":1');

		debug.mockRestore();
		process.env.NODE_ENV = original;
	});
});
