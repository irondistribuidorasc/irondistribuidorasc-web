import type { Brand, Category, Product } from "@/src/data/products";

const validBrands: Brand[] = ["Samsung", "Xiaomi", "Motorola", "iPhone", "LG"];
const validCategories: Category[] = [
  "display",
  "battery",
  "charging_board",
  "back_cover",
];

/**
 * Valida se um valor é uma marca válida
 */
function isValidBrand(value: unknown): value is Brand {
  return typeof value === "string" && validBrands.includes(value as Brand);
}

/**
 * Valida se um valor é uma categoria válida
 */
function isValidCategory(value: unknown): value is Category {
  return (
    typeof value === "string" && validCategories.includes(value as Category)
  );
}

/**
 * Valida se um objeto é um produto válido
 */
function isValidProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;

  // Campos obrigatórios
  if (typeof product.id !== "string" || !product.id) return false;
  if (typeof product.code !== "string" || !product.code) return false;
  if (typeof product.name !== "string" || !product.name) return false;
  if (!isValidBrand(product.brand)) return false;
  if (!isValidCategory(product.category)) return false;
  if (typeof product.model !== "string" || !product.model) return false;
  if (typeof product.imageUrl !== "string" || !product.imageUrl) return false;
  if (typeof product.inStock !== "boolean") return false;
  if (typeof product.price !== "number" || product.price < 0) return false;

  // Campos opcionais
  if (
    product.restockDate !== undefined &&
    typeof product.restockDate !== "string"
  ) {
    return false;
  }
  if (
    product.description !== undefined &&
    typeof product.description !== "string"
  ) {
    return false;
  }
  if (product.tags !== undefined && !Array.isArray(product.tags)) {
    return false;
  }
  if (product.tags && !product.tags.every((tag) => typeof tag === "string")) {
    return false;
  }
  if (
    product.popularity !== undefined &&
    typeof product.popularity !== "number"
  ) {
    return false;
  }

  return true;
}

/**
 * Valida e retorna um array de produtos
 * @throws Error se o JSON for inválido
 */
export function validateProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) {
    throw new Error("Products data must be an array");
  }

  const validProducts: Product[] = [];
  const errors: string[] = [];

  data.forEach((item, index) => {
    if (isValidProduct(item)) {
      validProducts.push(item);
    } else {
      errors.push(`Invalid product at index ${index}: ${JSON.stringify(item)}`);
    }
  });

  if (errors.length > 0) {
    console.warn("Some products failed validation:", errors);
  }

  if (validProducts.length === 0) {
    throw new Error("No valid products found in data");
  }

  return validProducts;
}
