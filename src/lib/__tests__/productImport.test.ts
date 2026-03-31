import { describe, expect, it } from "vitest";

import { parseImportedCategory } from "../productImport";

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
