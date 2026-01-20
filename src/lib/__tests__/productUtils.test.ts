import { describe, expect, it } from "vitest";

import type { Product } from "@/src/data/products";
import {
	filterProducts,
	formatPrice,
	formatRestockDate,
	getPageRange,
	getRelevanceScore,
	getTotalPages,
	paginateProducts,
	sortProducts,
} from "../productUtils";

function makeProduct(overrides: Partial<Product>): Product {
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

describe("productUtils", () => {
	describe("getRelevanceScore", () => {
		it("prioriza inStock com bônus grande e usa popularity", () => {
			expect(
				getRelevanceScore(makeProduct({ inStock: true, popularity: 0 })),
			).toBe(10000);
			expect(
				getRelevanceScore(makeProduct({ inStock: false, popularity: 80 })),
			).toBe(80);
			expect(getRelevanceScore(makeProduct({ inStock: false }))).toBe(50);
		});
	});

	describe("sortProducts", () => {
		it("ordena por preço asc/desc", () => {
			const a = makeProduct({ id: "a", price: 10 });
			const b = makeProduct({ id: "b", price: 5 });
			const c = makeProduct({ id: "c", price: 20 });

			expect(sortProducts([a, b, c], "price_asc").map((p) => p.id)).toEqual([
				"b",
				"a",
				"c",
			]);
			expect(sortProducts([a, b, c], "price_desc").map((p) => p.id)).toEqual([
				"c",
				"a",
				"b",
			]);
		});

		it("ordena por relevância e desempata por nome", () => {
			const a = makeProduct({
				id: "a",
				name: "B Produto",
				inStock: true,
				popularity: 50,
			});
			const b = makeProduct({
				id: "b",
				name: "A Produto",
				inStock: true,
				popularity: 50,
			});
			const c = makeProduct({
				id: "c",
				name: "C Produto",
				inStock: false,
				popularity: 99,
			});

			// a e b têm mesmo score (inStock + 50), então vem pelo nome; ambos antes do c por inStock
			expect(sortProducts([a, c, b], "relevance").map((p) => p.id)).toEqual([
				"b",
				"a",
				"c",
			]);
		});
	});

	describe("filterProducts", () => {
		it("filtra por marca, categoria, estoque e busca", () => {
			const p1 = makeProduct({
				id: "1",
				brand: "Samsung",
				category: "display",
				inStock: true,
				name: "Display A01",
				code: "DISP-1",
				model: "A01",
			});
			const p2 = makeProduct({
				id: "2",
				brand: "Xiaomi",
				category: "battery",
				inStock: false,
				name: "Bateria Redmi",
				code: "BAT-2",
				model: "Redmi 12",
			});

			const base = {
				brands: [],
				categories: [],
				inStockOnly: false,
				searchQuery: "",
			};

			expect(filterProducts([p1, p2], base).map((p) => p.id)).toEqual([
				"1",
				"2",
			]);
			expect(
				filterProducts([p1, p2], { ...base, brands: ["Samsung"] }).map(
					(p) => p.id,
				),
			).toEqual(["1"]);
			expect(
				filterProducts([p1, p2], { ...base, categories: ["battery"] }).map(
					(p) => p.id,
				),
			).toEqual(["2"]);
			expect(
				filterProducts([p1, p2], { ...base, inStockOnly: true }).map(
					(p) => p.id,
				),
			).toEqual(["1"]);
			expect(
				filterProducts([p1, p2], { ...base, searchQuery: "redmi" }).map(
					(p) => p.id,
				),
			).toEqual(["2"]);
			expect(
				filterProducts([p1, p2], { ...base, searchQuery: "disp-1" }).map(
					(p) => p.id,
				),
			).toEqual(["1"]);
		});
	});

	describe("formatPrice", () => {
		it("formata BRL", () => {
			const formatted = formatPrice(1);
			expect(formatted).toContain("R$");
			expect(formatted).toContain("1,00");
		});
	});

	describe("formatRestockDate", () => {
		it("formata data válida", () => {
			// Usa formato ISO com timezone para evitar problemas de fuso horário
			expect(formatRestockDate("2025-12-26T12:00:00")).toContain("26/12/2025");
		});

		it("lança erro para data inválida", () => {
			expect(() => formatRestockDate("not-a-date")).toThrow(
				/Invalid date string/,
			);
		});
	});

	describe("paginateProducts / getTotalPages", () => {
		it("pagina corretamente", () => {
			const products = Array.from({ length: 10 }, (_, i) =>
				makeProduct({ id: String(i + 1) }),
			);
			expect(paginateProducts(products, 1, 3).map((p) => p.id)).toEqual([
				"1",
				"2",
				"3",
			]);
			expect(paginateProducts(products, 2, 3).map((p) => p.id)).toEqual([
				"4",
				"5",
				"6",
			]);
		});

		it("calcula total de páginas", () => {
			expect(getTotalPages(0, 10)).toBe(0);
			expect(getTotalPages(1, 10)).toBe(1);
			expect(getTotalPages(10, 10)).toBe(1);
			expect(getTotalPages(11, 10)).toBe(2);
		});
	});

	describe("getPageRange", () => {
		it("retorna todas as páginas quando total <= maxVisible", () => {
			expect(getPageRange(1, 3, 5)).toEqual([1, 2, 3]);
		});

		it("centraliza range em torno da página atual quando possível", () => {
			expect(getPageRange(5, 10, 5)).toEqual([3, 4, 5, 6, 7]);
		});

		it("ajusta range no início e no fim", () => {
			expect(getPageRange(1, 10, 5)).toEqual([1, 2, 3, 4, 5]);
			expect(getPageRange(10, 10, 5)).toEqual([6, 7, 8, 9, 10]);
		});
	});
});
