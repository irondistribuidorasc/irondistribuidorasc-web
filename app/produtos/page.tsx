import ProductCatalog from "@/src/components/produtos/ProductCatalog";
import type { Brand, Category, Product } from "@/src/data/products";
import { db } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Peças | Iron Distribuidora",
  description:
    "Confira nosso catálogo completo de peças para celular. Telas, baterias e componentes para iPhone, Samsung, Xiaomi e Motorola com preços de atacado.",
  alternates: {
    canonical: "https://irondistribuidorasc.com.br/produtos",
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    page?: string;
    sort?: string;
    inStock?: string;
  }>;
};

export default async function ProdutosPage(props: Props) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const category = searchParams.category as Category | undefined;
  const brand = searchParams.brand as Brand | undefined;
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort || "relevance";
  const inStockOnly = searchParams.inStock === "true";

  const limit = 60; // Items per page
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ProductWhereInput = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { code: { contains: searchQuery, mode: "insensitive" } },
      { model: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (brand) {
    where.brand = brand;
  }

  if (inStockOnly) {
    where.inStock = true;
  }

  // Build order by
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "relevance":
    default:
      if (searchQuery) {
        // If searching, we might want to order by relevance if we had full text search,
        // but for now let's stick to popularity or name
        orderBy = { popularity: "desc" };
      } else {
        orderBy = { popularity: "desc" };
      }
      break;
  }

  // Fetch data
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Map Prisma products to the Product type expected by the frontend
  const mappedProducts: Product[] = products.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    brand: p.brand as Brand,
    category: p.category as Category,
    model: p.model,
    imageUrl: p.imageUrl,
    inStock: p.inStock,
    restockDate: p.restockDate ? p.restockDate.toISOString() : undefined,
    price: p.price,
    description: p.description || undefined,
    tags: p.tags,
    popularity: p.popularity,
  }));

  return (
    <ProductCatalog
      products={mappedProducts}
      totalProducts={total}
      totalPages={totalPages}
      currentPage={page}
      searchQuery={searchQuery}
      initialCategory={category}
      initialBrand={brand}
    />
  );
}
