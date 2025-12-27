import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/src/data/products";
import { useProductFilters } from "../useProductFilters";

const pushMock = vi.fn();
let currentSearchParams = "page=2&sort=price_desc&inStock=true&brand=Samsung";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	useSearchParams: () => ({
		get: (key: string) => new URLSearchParams(currentSearchParams).get(key),
		toString: () => currentSearchParams,
	}),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
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

describe("useProductFilters", () => {
	beforeEach(() => {
		pushMock.mockReset();
		currentSearchParams = "page=2&sort=price_desc&inStock=true&brand=Samsung";
		window.history.pushState({}, "", "/produtos");
	});

	it("lê sort/inStock do URL e atualiza URL ao buscar", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 2, ""),
		);

		expect(result.current.sortOption).toBe("price_desc");
		expect(result.current.filters.inStockOnly).toBe(true);

		act(() => {
			result.current.setSearchQuery("abc");
		});

		expect(pushMock).toHaveBeenCalledTimes(1);
		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("search")).toBe("abc");
		expect(params.get("page")).toBe("1"); // reseta página
	});

	it("setSortOption não reseta página", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 5, 2, ""),
		);

		act(() => {
			result.current.setSortOption("price_asc");
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("sort")).toBe("price_asc");
		expect(params.get("page")).toBe("2");
	});

	it("toggleBrand remove o brand quando já selecionado", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 2, ""),
		);

		act(() => {
			result.current.toggleBrand("Samsung");
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("brand")).toBeNull();
		expect(params.get("page")).toBe("1");
	});

	it("toggleBrand adiciona o brand quando não selecionado", () => {
		currentSearchParams = "page=1&sort=relevance";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, ""),
		);

		act(() => {
			result.current.toggleBrand("Xiaomi");
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("brand")).toBe("Xiaomi");
	});

	it("toggleCategory remove a categoria quando já selecionada", () => {
		currentSearchParams = "page=1&category=display";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, "", "display"),
		);

		act(() => {
			result.current.toggleCategory("display");
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("category")).toBeNull();
	});

	it("toggleCategory adiciona a categoria quando não selecionada", () => {
		currentSearchParams = "page=1";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, ""),
		);

		act(() => {
			result.current.toggleCategory("battery");
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("category")).toBe("battery");
	});

	it("setInStockOnly adiciona inStock=true", () => {
		currentSearchParams = "page=1";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, ""),
		);

		act(() => {
			result.current.setInStockOnly(true);
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("inStock")).toBe("true");
	});

	it("setInStockOnly remove inStock quando false", () => {
		currentSearchParams = "page=1&inStock=true";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, ""),
		);

		act(() => {
			result.current.setInStockOnly(false);
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("inStock")).toBeNull();
	});

	it("setPage navega para página específica", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 10, 5, 1, ""),
		);

		act(() => {
			result.current.setPage(3);
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("page")).toBe("3");
	});

	it("goToFirstPage navega para página 1", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 10, 5, 3, ""),
		);

		act(() => {
			result.current.goToFirstPage();
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("page")).toBe("1");
	});

	it("goToLastPage navega para última página", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 10, 5, 1, ""),
		);

		act(() => {
			result.current.goToLastPage();
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("page")).toBe("5");
	});

	it("goToNextPage incrementa página atual", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 10, 5, 2, ""),
		);

		act(() => {
			result.current.goToNextPage();
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("page")).toBe("3");
	});

	it("goToPreviousPage decrementa página atual", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 10, 5, 3, ""),
		);

		act(() => {
			result.current.goToPreviousPage();
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("page")).toBe("2");
	});

	it("clearFilters volta para pathname atual", () => {
		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 2, ""),
		);

		act(() => {
			result.current.clearFilters();
		});

		expect(pushMock).toHaveBeenCalledWith("/produtos", { scroll: true });
	});

	it("hasActiveFilters retorna true quando há filtros ativos", () => {
		currentSearchParams = "page=1&brand=Samsung";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, "", undefined, "Samsung"),
		);

		expect(result.current.hasActiveFilters).toBe(true);
	});

	it("hasActiveFilters retorna false quando não há filtros", () => {
		currentSearchParams = "page=1";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, ""),
		);

		expect(result.current.hasActiveFilters).toBe(false);
	});

	it("setSearchQuery com string vazia remove o parâmetro search", () => {
		currentSearchParams = "page=1&search=teste";

		const { result } = renderHook(() =>
			useProductFilters([makeProduct()], 1, 1, 1, "teste"),
		);

		act(() => {
			result.current.setSearchQuery("");
		});

		const [url] = pushMock.mock.calls[0]!;
		const params = new URLSearchParams(String(url).replace(/^\?/, ""));
		expect(params.get("search")).toBeNull();
	});

	it("retorna valores corretos para paginação", () => {
		const products = [makeProduct(), makeProduct({ id: "p2" })];

		const { result } = renderHook(() =>
			useProductFilters(products, 120, 5, 2, ""),
		);

		expect(result.current.paginatedProducts).toEqual(products);
		expect(result.current.totalProducts).toBe(120);
		expect(result.current.totalPages).toBe(5);
		expect(result.current.currentPage).toBe(2);
		expect(result.current.itemsPerPage).toBe(60);
	});
});
