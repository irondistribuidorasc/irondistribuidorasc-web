import type { PublicProduct, Product } from "@/src/data/products";
import type { Session } from "next-auth";

type ProductRecord = {
  id: string;
  code: string;
  name: string;
  brand: Product["brand"] | string;
  category: Product["category"] | string;
  model: string;
  imageUrl: string;
  inStock: boolean;
  restockDate?: Date | string | null;
  price: number;
  description?: string | null;
  tags?: string[];
  popularity?: number;
};

type SearchProductRecord = Pick<
  ProductRecord,
  "id" | "name" | "imageUrl" | "price" | "code" | "brand"
>;

type ProductJsonLdInput = Pick<
  ProductRecord,
  "id" | "name" | "imageUrl" | "description" | "code" | "brand" | "price" | "inStock"
>;

export type PublicSearchResult = {
  id: string;
  name: string;
  imageUrl: string | null;
  code: string;
  brand: string;
  price?: number;
};

export function canViewB2BPrices(
  session: Pick<Session, "user"> | null | undefined
): boolean {
  return session?.user?.approved === true;
}

export function hasVisiblePrice(product: PublicProduct): product is Product {
  return typeof product.price === "number";
}

export function toPublicProduct(
  product: ProductRecord,
  canViewPrices: boolean
): PublicProduct {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    brand: product.brand as Product["brand"],
    category: product.category as Product["category"],
    model: product.model,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    restockDate: normalizeRestockDate(product.restockDate),
    description: product.description || undefined,
    tags: product.tags,
    popularity: product.popularity,
    ...(canViewPrices ? { price: product.price } : {}),
  };
}

export function toPublicSearchResult(
  product: SearchProductRecord,
  canViewPrices: boolean
): PublicSearchResult {
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    code: product.code,
    brand: product.brand,
    ...(canViewPrices ? { price: product.price } : {}),
  };
}

export function buildProductJsonLd(
  product: ProductJsonLdInput,
  canViewPrices: boolean
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description:
      product.description || `Compre ${product.name} na Iron Distribuidora.`,
    sku: product.code,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://irondistribuidorasc.com.br/produtos/${product.id}`,
      priceCurrency: "BRL",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(canViewPrices ? { price: product.price } : {}),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "1",
    },
  };
}

function normalizeRestockDate(date?: Date | string | null): string | undefined {
  if (!date) {
    return undefined;
  }

  return date instanceof Date ? date.toISOString() : date;
}
