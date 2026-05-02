import { describe, expect, it } from "vitest";

import { normalizeImportedProductRow, parseImportedCategory } from "../productImport";

describe("parseImportedCategory", () => {
  it("aceita a categoria lens no CSV", () => {
    expect(parseImportedCategory(" Lens ", 3)).toEqual({
      category: "lens",
    });
  });

  it("aceita uma das novas categorias no CSV", () => {
    expect(parseImportedCategory(" charging_flex ", 6)).toEqual({
      category: "charging_flex",
    });
  });

  it("retorna erro quando a categoria está ausente", () => {
    expect(parseImportedCategory("", 4)).toEqual({
      error: "Linha 4: Categoria é obrigatória e deve usar um slug válido",
    });
  });

  it("retorna erro quando a categoria está fora da lista canônica", () => {
    expect(parseImportedCategory("other", 5)).toEqual({
      error: "Linha 5: Categoria inválida 'other'. Use um slug suportado.",
    });
  });
});

describe("normalizeImportedProductRow", () => {
  it("normaliza uma linha CSV valida com defaults", () => {
    expect(
      normalizeImportedProductRow(
        {
          code: "TELA-001",
          name: "Tela iPhone 11",
          price: "129.9",
          category: "lens",
        },
        2,
      ),
    ).toEqual({
      product: {
        code: "TELA-001",
        name: "Tela iPhone 11",
        brand: "Generic",
        category: "lens",
        model: "",
        imageUrl: "/logo-iron.png",
        inStock: false,
        stockQuantity: 0,
        minStockThreshold: 10,
        price: 129.9,
        description: "",
        tags: [],
        popularity: 0,
      },
    });
  });

  it("normaliza inteiros e tags quando os campos opcionais sao enviados", () => {
    expect(
      normalizeImportedProductRow(
        {
          code: "BAT-001",
          name: "Bateria Premium",
          price: "87",
          brand: "Iron",
          category: "charging_flex",
          model: "IP11",
          imageUrl: "https://example.com/bateria.png",
          stockQuantity: "12",
          minStockThreshold: "3",
          description: "Linha premium",
          tags: "iphone;bateria",
          popularity: "9",
        },
        3,
      ),
    ).toEqual({
      product: {
        code: "BAT-001",
        name: "Bateria Premium",
        brand: "Iron",
        category: "charging_flex",
        model: "IP11",
        imageUrl: "https://example.com/bateria.png",
        inStock: true,
        stockQuantity: 12,
        minStockThreshold: 3,
        price: 87,
        description: "Linha premium",
        tags: ["iphone", "bateria"],
        popularity: 9,
      },
    });
  });

  it.each([
    ["price", "-1", "Linha 4: Preco invalido para produto NEG-001"],
    ["stockQuantity", "-1", "Linha 4: Estoque invalido para produto NEG-001"],
    ["minStockThreshold", "-1", "Linha 4: Estoque minimo invalido para produto NEG-001"],
    ["popularity", "-1", "Linha 4: Popularidade invalida para produto NEG-001"],
  ])("rejeita %s negativo", (field, value, error) => {
    expect(
      normalizeImportedProductRow(
        {
          code: "NEG-001",
          name: "Produto negativo",
          price: "10",
          category: "lens",
          [field]: value,
        },
        4,
      ),
    ).toEqual({ error });
  });

  it.each([
    ["stockQuantity", "10abc", "Linha 5: Estoque invalido para produto BAD-001"],
    ["minStockThreshold", "1.5", "Linha 5: Estoque minimo invalido para produto BAD-001"],
    ["popularity", "abc", "Linha 5: Popularidade invalida para produto BAD-001"],
  ])("rejeita %s invalido ou parcial", (field, value, error) => {
    expect(
      normalizeImportedProductRow(
        {
          code: "BAD-001",
          name: "Produto invalido",
          price: "10",
          category: "lens",
          [field]: value,
        },
        5,
      ),
    ).toEqual({ error });
  });

  it("rejeita preco invalido", () => {
    expect(
      normalizeImportedProductRow(
        {
          code: "PRICE-001",
          name: "Produto sem preco valido",
          price: "abc",
          category: "lens",
        },
        6,
      ),
    ).toEqual({
      error: "Linha 6: Preco invalido para produto PRICE-001",
    });
  });

  it("mantem erro de categoria invalida", () => {
    expect(
      normalizeImportedProductRow(
        {
          code: "CAT-001",
          name: "Produto categoria invalida",
          price: "10",
          category: "other",
        },
        7,
      ),
    ).toEqual({
      error: "Linha 7: Categoria inválida 'other'. Use um slug suportado.",
    });
  });
});
