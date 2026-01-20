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

	// Testes de campos obrigatórios
	it("rejeita produto sem id", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), id: "" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com id não-string", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), id: 123 };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto sem code", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), code: "" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com code não-string", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), code: 456 };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto sem name", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), name: "" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com name não-string", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), name: null };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com brand inválida", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), brand: "InvalidBrand" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com category inválida", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), category: "invalid_category" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto sem model", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), model: "" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com model não-string", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), model: 999 };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto sem imageUrl", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), imageUrl: "" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com imageUrl não-string", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), imageUrl: undefined };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com inStock não-boolean", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), inStock: "yes" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com price negativo", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), price: -10 };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("rejeita produto com price não-number", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const valid = makeValidProduct();
		const invalidProduct = { ...makeValidProduct(), price: "free" };
		const result = validateProducts([valid, invalidProduct]);
		expect(result).toEqual([valid]);
		warn.mockRestore();
	});

	it("aceita produto com price zero", () => {
		const validWithZeroPrice = makeValidProduct({ price: 0 });
		const result = validateProducts([validWithZeroPrice]);
		expect(result).toEqual([validWithZeroPrice]);
	});

	it("aceita todas as brands válidas", () => {
		const brands = ["Samsung", "Xiaomi", "Motorola", "iPhone", "LG"] as const;
		const products = brands.map((brand, i) =>
			makeValidProduct({ id: `p${i}`, brand }),
		);
		const result = validateProducts(products);
		expect(result).toHaveLength(5);
	});

	it("aceita todas as categories válidas", () => {
		const categories = [
			"display",
			"battery",
			"charging_board",
			"back_cover",
		] as const;
		const products = categories.map((category, i) =>
			makeValidProduct({ id: `p${i}`, category }),
		);
		const result = validateProducts(products);
		expect(result).toHaveLength(4);
	});
});
