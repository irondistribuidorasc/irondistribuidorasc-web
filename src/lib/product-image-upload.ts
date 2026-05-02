import { randomUUID } from "node:crypto";

export const PRODUCT_IMAGE_BUCKET = "products";
export const PRODUCT_IMAGE_PREFIX = "products";
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_PRODUCT_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type ProductImageUploadInput = {
  type: string;
  size: number;
};

type ProductImageUploadValidation =
  | {
      valid: true;
    }
  | {
      valid: false;
      error: string;
    };

export function validateProductImageUpload(
  file: ProductImageUploadInput,
): ProductImageUploadValidation {
  if (file.size <= 0) {
    return {
      valid: false,
      error: "Arquivo vazio ou inválido.",
    };
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return {
      valid: false,
      error: "Imagem muito grande. Tamanho máximo: 5MB.",
    };
  }

  if (!ALLOWED_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Tipo de imagem inválido. Use JPG, PNG ou WEBP.",
    };
  }

  return { valid: true };
}

export function getProductImageExtension(mimeType: string): string {
  const extension = ALLOWED_PRODUCT_IMAGE_TYPES.get(mimeType);

  if (!extension) {
    throw new Error("Tipo de imagem inválido");
  }

  return extension;
}

export function buildProductImagePath(
  mimeType: string,
  id = randomUUID(),
): string {
  return `${PRODUCT_IMAGE_PREFIX}/${id}.${getProductImageExtension(mimeType)}`;
}
