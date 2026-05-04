import ProductCatalog from "@/src/components/produtos/ProductCatalog";
import { parseCategory, type Brand } from "@/src/data/products";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { canViewB2BPrices, toPublicProduct } from "@/src/lib/product-visibility";
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

export const revalidate = 300; // 5 minutos

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
  const session = await auth();
  const canViewPrices = canViewB2BPrices(session);
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const category = parseCategory(searchParams.category) ?? undefined;
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
      orderBy = canViewPrices ? { price: "asc" } : { popularity: "desc" };
      break;
    case "price_desc":
      orderBy = canViewPrices ? { price: "desc" } : { popularity: "desc" };
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

  const mappedProducts = products.map((product) =>
    toPublicProduct(product, canViewPrices)
  );

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
