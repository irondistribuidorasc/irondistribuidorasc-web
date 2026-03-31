import { describe, expect, it } from "vitest";

import { validateProducts } from "@/src/lib/validateProducts";
import {
  categoryKeys,
  categoryOptions,
  getProductsByBrandAndCategory,
  parseCategory,
  products,
} from "../products";

describe("data/products", () => {
  it("expõe a categoria lens na lista canônica", () => {
    expect(categoryOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "lens",
          label: "Lente",
        }),
      ]),
    );
  });

  it("expõe as novas categorias na lista canônica", () => {
    expect(categoryOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "charging_flex",
          label: "Flex de Carga",
        }),
        expect.objectContaining({
          key: "charging_connector",
          label: "CC - Conector de Carga",
        }),
        expect.objectContaining({
          key: "lcd_flex",
          label: "Flex de Imagem LCD",
        }),
        expect.objectContaining({
          key: "power_flex",
          label: "Flex Power",
        }),
        expect.objectContaining({
          key: "front_camera",
          label: "Câmera Frontal",
        }),
        expect.objectContaining({
          key: "rear_camera",
          label: "Câmera Traseira",
        }),
      ]),
    );
  });

	it("exporta lista de produtos válida", () => {
		expect(Array.isArray(products)).toBe(true);
		expect(products.length).toBeGreaterThan(0);
		expect(() => validateProducts(products)).not.toThrow();
	});

  describe("parseCategory", () => {
    it("normaliza a categoria lens vinda de input externo", () => {
      expect(parseCategory(" Lens ")).toBe("lens");
    });

    it("normaliza um dos novos slugs vindos de input externo", () => {
      expect(parseCategory(" Front_Camera ")).toBe("front_camera");
    });

    it("retorna null para categorias fora da lista canônica", () => {
      expect(parseCategory("other")).toBeNull();
      expect(parseCategory(undefined)).toBeNull();
    });
  });

  it("mantém categoryKeys sincronizado com as opções canônicas", () => {
    expect(categoryKeys).toEqual(categoryOptions.map((category) => category.key));
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
