import { randomUUID } from "node:crypto";

export const PRODUCT_IMAGE_BUCKET = "products";
export const PRODUCT_IMAGE_PREFIX = "products";
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_PRODUCT_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

// Magic bytes para validação de file signature
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF
};

function hasValidMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return false;

  // Para WEBP, verificar também o header WEBP nos bytes 8-11
  if (mimeType === "image/webp") {
    if (buffer.length < 12) return false;
    const webpHeader = [0x57, 0x45, 0x42, 0x50]; // WEBP
    for (let i = 0; i < webpHeader.length; i++) {
      if (buffer[8 + i] !== webpHeader[i]) return false;
    }
    return true;
  }

  if (buffer.length < expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false;
  }
  return true;
}

type ProductImageUploadInput = {
  type: string;
  size: number;
  buffer?: Uint8Array;
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

  if (file.buffer && !hasValidMagicBytes(file.buffer, file.type)) {
    return {
      valid: false,
      error: "Arquivo não corresponde ao tipo de imagem declarado.",
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
