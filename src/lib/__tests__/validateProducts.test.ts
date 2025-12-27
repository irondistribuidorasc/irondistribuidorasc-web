import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/src/data/products";
import { validateProducts } from "../validateProducts";

function makeValidProduct(overrides: Partial<Product> = {}): Product {
	return {
		id: "p1",
		code: "CODE-1",
		name: "Produto 1",
		brand: "Samsung",
		category: "display",
		model: "A01",
		imageUrl: "/logo-iron.png",
		inStock: true,
		price: 10,
		...overrides,
	};
}

describe("validateProducts", () => {
	it("lança erro quando não é array", () => {
		expect(() => validateProducts({})).toThrow(
			"Products data must be an array",
		);
	});

	it("retorna somente produtos válidos e avisa quando há inválidos", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const result = validateProducts([valid, { foo: "bar" }]);
		expect(result).toEqual([valid]);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it("lança erro quando nenhum produto é válido", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(() => validateProducts([{ foo: "bar" }])).toThrow(
			"No valid products found in data",
		);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it("rejeita produto null", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const result = validateProducts([valid, null]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com restockDate inválido", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct({ id: "p2" }), restockDate: 123 };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com description inválida", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct({ id: "p2" }), description: 123 };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com tags não sendo array", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct({ id: "p2" }), tags: "not-an-array" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com tags contendo não-strings", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct({ id: "p2" }), tags: [123, "valid"] };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com popularity inválido", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct({ id: "p2" }), popularity: "high" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("aceita produto com campos opcionais válidos", () => {
		const validWithOptionals = makeValidProduct({
			restockDate: "2025-12-26",
			description: "Descrição do produto",
			tags: ["tag1", "tag2"],
			popularity: 80,
		});
		const result = validateProducts([validWithOptionals]);
		expect(result).toEqual([validWithOptionals]);
	});
});
