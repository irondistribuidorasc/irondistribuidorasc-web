import { describe, expect, it } from "vitest";
import {
  validateProductImageUpload,
  getProductImageExtension,
  buildProductImagePath,
  MAX_PRODUCT_IMAGE_SIZE,
} from "../product-image-upload";

describe("validateProductImageUpload", () => {
  it("rejects empty file", () => {
    const result = validateProductImageUpload({
      type: "image/jpeg",
      size: 0,
    });
    expect(result.valid).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("rejects file exceeding max size", () => {
    const result = validateProductImageUpload({
      type: "image/jpeg",
      size: MAX_PRODUCT_IMAGE_SIZE + 1,
    });
    expect(result.valid).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("rejects invalid mime type", () => {
    const result = validateProductImageUpload({
      type: "image/gif",
      size: 1024,
    });
    expect(result.valid).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("accepts valid JPEG without buffer", () => {
    const result = validateProductImageUpload({
      type: "image/jpeg",
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it("accepts valid PNG without buffer", () => {
    const result = validateProductImageUpload({
      type: "image/png",
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it("accepts valid WEBP without buffer", () => {
    const result = validateProductImageUpload({
      type: "image/webp",
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects buffer with invalid JPEG magic bytes", () => {
    const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const result = validateProductImageUpload({
      type: "image/jpeg",
      size: 1024,
      buffer,
    });
    expect(result.valid).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("accepts buffer with valid JPEG magic bytes", () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const result = validateProductImageUpload({
      type: "image/jpeg",
      size: 1024,
      buffer,
    });
    expect(result.valid).toBe(true);
  });

  it("accepts buffer with valid PNG magic bytes", () => {
    const buffer = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const result = validateProductImageUpload({
      type: "image/png",
      size: 1024,
      buffer,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects buffer too short for WEBP", () => {
    const buffer = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    const result = validateProductImageUpload({
      type: "image/webp",
      size: 1024,
      buffer,
    });
    expect(result.valid).toBe(false);
  });

  it("accepts buffer with valid WEBP magic bytes", () => {
    const buffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
      0x57, 0x45, 0x42, 0x50,
    ]);
    const result = validateProductImageUpload({
      type: "image/webp",
      size: 1024,
      buffer,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects WEBP buffer with wrong WEBP header", () => {
    const buffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);
    const result = validateProductImageUpload({
      type: "image/webp",
      size: 1024,
      buffer,
    });
    expect(result.valid).toBe(false);
  });
});

describe("getProductImageExtension", () => {
  it("returns jpg for image/jpeg", () => {
    expect(getProductImageExtension("image/jpeg")).toBe("jpg");
  });

  it("returns png for image/png", () => {
    expect(getProductImageExtension("image/png")).toBe("png");
  });

  it("returns webp for image/webp", () => {
    expect(getProductImageExtension("image/webp")).toBe("webp");
  });

  it("throws for invalid mime type", () => {
    expect(() => getProductImageExtension("image/gif")).toThrow();
  });
});

describe("buildProductImagePath", () => {
  it("builds path with auto-generated id", () => {
    const path = buildProductImagePath("image/jpeg");
    expect(path).toMatch(/^products\/[a-f0-9-]+\.jpg$/);
  });

  it("builds path with provided id", () => {
    const path = buildProductImagePath("image/png", "test-123");
    expect(path).toBe("products/test-123.png");
  });

  it("builds path for webp", () => {
    const path = buildProductImagePath("image/webp", "abc");
    expect(path).toBe("products/abc.webp");
  });
});
