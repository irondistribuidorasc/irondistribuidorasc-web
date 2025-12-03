"use server";

import { db } from "@/src/lib/prisma";

export type SearchResult = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  code: string;
  brand: string;
};

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
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
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
