import { parseCategory, type Category } from "@/src/data/products";

type ImportedCategoryResult =
  | {
      category: Category;
    }
  | {
      error: string;
    };

export function parseImportedCategory(
  rawCategory: string | undefined,
  rowNumber: number,
): ImportedCategoryResult {
  if (!rawCategory?.trim()) {
    return {
      error: `Linha ${rowNumber}: Categoria é obrigatória e deve usar um slug válido`,
    };
  }

  const category = parseCategory(rawCategory);

  if (!category) {
    return {
      error: `Linha ${rowNumber}: Categoria inválida '${rawCategory}'. Use um slug suportado.`,
    };
  }

  return { category };
}
