import { parseCategory, type Category } from "@/src/data/products";

export interface ImportedProductRow {
  code?: string;
  name?: string;
  price?: string;
  brand?: string;
  category?: string;
  model?: string;
  imageUrl?: string;
  stockQuantity?: string;
  minStockThreshold?: string;
  description?: string;
  tags?: string;
  popularity?: string;
}

export interface ImportedProductData {
  code: string;
  name: string;
  brand: string;
  category: Category;
  model: string;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  minStockThreshold: number;
  price: number;
  description: string;
  tags: string[];
  popularity: number;
}

type ImportedCategoryResult =
  | {
      category: Category;
    }
  | {
      error: string;
    };

type ImportedProductResult =
  | {
      product: ImportedProductData;
    }
  | {
      error: string;
    };

const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;

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

export function normalizeImportedProductRow(
  productData: ImportedProductRow,
  rowNumber: number,
): ImportedProductResult {
  const code = productData.code?.trim() ?? "";
  const name = productData.name?.trim() ?? "";
  const rawPrice = productData.price?.trim() ?? "";

  if (!code || !name || !rawPrice) {
    return {
      error: `Linha ${rowNumber}: Campos obrigatórios ausentes (code, name ou price)`,
    };
  }

  const price = parseNonNegativeDecimal(rawPrice);
  if (price === null) {
    return {
      error: `Linha ${rowNumber}: Preco invalido para produto ${code}`,
    };
  }

  const parsedCategory = parseImportedCategory(productData.category, rowNumber);
  if ("error" in parsedCategory) {
    return parsedCategory;
  }

  const stockQuantity = parseOptionalNonNegativeInteger(
    productData.stockQuantity,
    0,
  );
  if (stockQuantity === null) {
    return {
      error: `Linha ${rowNumber}: Estoque invalido para produto ${code}`,
    };
  }

  const minStockThreshold = parseOptionalNonNegativeInteger(
    productData.minStockThreshold,
    10,
  );
  if (minStockThreshold === null) {
    return {
      error: `Linha ${rowNumber}: Estoque minimo invalido para produto ${code}`,
    };
  }

  const popularity = parseOptionalNonNegativeInteger(productData.popularity, 0);
  if (popularity === null) {
    return {
      error: `Linha ${rowNumber}: Popularidade invalida para produto ${code}`,
    };
  }

  return {
    product: {
      code,
      name,
      brand: productData.brand?.trim() || "Generic",
      category: parsedCategory.category,
      model: productData.model?.trim() || "",
      imageUrl: productData.imageUrl?.trim() || "/logo-iron.png",
      inStock: stockQuantity > 0,
      stockQuantity,
      minStockThreshold,
      price,
      description: productData.description?.trim() || "",
      tags: parseTags(productData.tags),
      popularity,
    },
  };
}

function parseNonNegativeDecimal(rawValue: string): number | null {
  if (!DECIMAL_PATTERN.test(rawValue)) return null;

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) return null;

  return value;
}

function parseOptionalNonNegativeInteger(
  rawValue: string | undefined,
  defaultValue: number,
): number | null {
  const normalizedValue = rawValue?.trim();
  if (!normalizedValue) return defaultValue;
  if (!INTEGER_PATTERN.test(normalizedValue)) return null;

  const value = Number(normalizedValue);
  if (!Number.isSafeInteger(value) || value < 0) return null;

  return value;
}

function parseTags(rawTags: string | undefined): string[] {
  if (!rawTags?.trim()) return [];

  return rawTags
    .split(";")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
