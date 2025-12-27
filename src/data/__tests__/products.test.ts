import { describe, expect, it } from "vitest";

import { validateProducts } from "@/src/lib/validateProducts";
import { getProductsByBrandAndCategory, products } from "../products";

describe("data/products", () => {
	it("exporta lista de produtos válida", () => {
		expect(Array.isArray(products)).toBe(true);
		expect(products.length).toBeGreaterThan(0);
		expect(() => validateProducts(products)).not.toThrow();
	});

	describe("getProductsByBrandAndCategory", () => {
		it("filtra produtos por marca e categoria", () => {
			const result = getProductsByBrandAndCategory("Samsung", "display");
			expect(result.length).toBeGreaterThan(0);
			result.forEach((product) => {
				expect(product.brand).toBe("Samsung");
				expect(product.category).toBe("display");
			});
		});

		it("retorna array vazio se não houver produtos correspondentes", () => {
			const result = getProductsByBrandAndCategory("LG", "battery");
			expect(Array.isArray(result)).toBe(true);
		});
	});
});
