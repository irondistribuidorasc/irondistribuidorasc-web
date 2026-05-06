import { describe, expect, it } from "vitest";
import { PRODUCT_PUBLIC_SELECT } from "@/src/lib/product-queries";
import {
  buildProductJsonLd,
  canViewB2BPrices,
  hasVisiblePrice,
  toPublicProduct,
  toPublicSearchResult,
} from "@/src/lib/product-visibility";

const product = {
  id: "product-1",
  code: "DISP-SAM-A02",
  name: "Display Samsung A02",
  brand: "Samsung",
  category: "display",
  model: "A02",
  imageUrl: "/logo-iron.webp",
  inStock: true,
  restockDate: null,
  price: 89.9,
  description: "Display de reposicao",
  tags: ["display"],
  popularity: 80,
};

describe("canViewB2BPrices", () => {
  it("allows only approved authenticated users", () => {
    expect(canViewB2BPrices(null)).toBe(false);
    expect(canViewB2BPrices({ user: { approved: false } })).toBe(false);
    expect(canViewB2BPrices({ user: { approved: true } })).toBe(true);
  });
});

describe("toPublicProduct", () => {
  it("omits price when user cannot view B2B prices", () => {
    const publicProduct = toPublicProduct(product, false);

    expect(publicProduct).not.toHaveProperty("price");
    expect(publicProduct.name).toBe(product.name);
  });

  it("keeps price when user can view B2B prices", () => {
    const publicProduct = toPublicProduct(product, true);

    expect(publicProduct.price).toBe(product.price);
  });

  it("normalizes string and Date restock dates", () => {
    expect(
      toPublicProduct({ ...product, restockDate: "2026-05-01" }, false)
        .restockDate
    ).toBe("2026-05-01");

    expect(
      toPublicProduct(
        { ...product, restockDate: new Date("2026-05-01T00:00:00.000Z") },
        false
      ).restockDate
    ).toBe("2026-05-01T00:00:00.000Z");
  });
});

describe("hasVisiblePrice", () => {
  it("detects when a public product carries a visible price", () => {
    expect(hasVisiblePrice(toPublicProduct(product, false))).toBe(false);
    expect(hasVisiblePrice(toPublicProduct(product, true))).toBe(true);
  });
});

describe("toPublicSearchResult", () => {
  it("omits price from search result when user cannot view B2B prices", () => {
    const result = toPublicSearchResult(product, false);

    expect(result).not.toHaveProperty("price");
    expect(result.code).toBe(product.code);
  });

  it("keeps price in search result when user can view B2B prices", () => {
    const result = toPublicSearchResult(product, true);

    expect(result.price).toBe(product.price);
  });
});

describe("buildProductJsonLd", () => {
  it("omits offer price when user cannot view B2B prices", () => {
    const jsonLd = buildProductJsonLd(product, false);

    expect(jsonLd.offers).not.toHaveProperty("price");
  });

  it("keeps offer price when user can view B2B prices", () => {
    const jsonLd = buildProductJsonLd(product, true);

    expect(jsonLd.offers).toMatchObject({ price: product.price });
  });

  it("uses fallback description and out-of-stock availability", () => {
    const jsonLd = buildProductJsonLd(
      { ...product, description: null, inStock: false },
      false
    );

    expect(jsonLd.description).toContain(product.name);
    expect(jsonLd.offers.availability).toBe("https://schema.org/OutOfStock");
  });
});

describe("product query select", () => {
  it("seleciona apenas os campos públicos necessários para catálogo e detalhe", () => {
    expect(PRODUCT_PUBLIC_SELECT).toMatchObject({
      id: true,
      code: true,
      name: true,
      brand: true,
      category: true,
      model: true,
      imageUrl: true,
      inStock: true,
      restockDate: true,
      price: true,
      description: true,
      tags: true,
      popularity: true,
    });
  });
});
