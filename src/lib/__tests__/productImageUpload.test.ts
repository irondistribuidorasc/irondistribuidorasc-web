import { describe, expect, it } from "vitest";

import {
  buildProductImagePath,
  getProductImageExtension,
  validateProductImageUpload,
} from "../product-image-upload";

describe("product image upload", () => {
  it("aceita imagens jpeg, png e webp ate 5MB", () => {
    expect(
      validateProductImageUpload({
        type: "image/jpeg",
        size: 5 * 1024 * 1024,
      }),
    ).toEqual({ valid: true });

    expect(
      validateProductImageUpload({ type: "image/png", size: 1024 }),
    ).toEqual({ valid: true });

    expect(
      validateProductImageUpload({ type: "image/webp", size: 1024 }),
    ).toEqual({ valid: true });
  });

  it("rejeita arquivo vazio, muito grande ou tipo nao permitido", () => {
    expect(
      validateProductImageUpload({ type: "image/jpeg", size: 0 }),
    ).toEqual({
      valid: false,
      error: "Arquivo vazio ou inválido.",
    });

    expect(
      validateProductImageUpload({
        type: "image/jpeg",
        size: 5 * 1024 * 1024 + 1,
      }),
    ).toEqual({
      valid: false,
      error: "Imagem muito grande. Tamanho máximo: 5MB.",
    });

    expect(
      validateProductImageUpload({ type: "image/gif", size: 1024 }),
    ).toEqual({
      valid: false,
      error: "Tipo de imagem inválido. Use JPG, PNG ou WEBP.",
    });
  });

  it("mapeia extensao pelo MIME type", () => {
    expect(getProductImageExtension("image/jpeg")).toBe("jpg");
    expect(getProductImageExtension("image/png")).toBe("png");
    expect(getProductImageExtension("image/webp")).toBe("webp");
  });

  it("gera path de imagem dentro do prefixo products", () => {
    expect(buildProductImagePath("image/jpeg", "fixed-id")).toBe(
      "products/fixed-id.jpg",
    );
  });
});
