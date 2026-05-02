"use server";

import { logger } from "@/src/lib/logger";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import {
  canViewB2BPrices,
  type PublicSearchResult,
  toPublicSearchResult,
} from "@/src/lib/product-visibility";

export type SearchResult = PublicSearchResult;

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const session = await auth();
    const canViewPrices = canViewB2BPrices(session);
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        price: true,
        code: true,
        brand: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return products.map((product) =>
      toPublicSearchResult(product, canViewPrices)
    );
  } catch (error) {
    logger.error("actions/search-products - Erro ao buscar produtos", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
