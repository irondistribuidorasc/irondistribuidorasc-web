
import { db } from "@/src/lib/prisma";
import ProductCatalog from "@/src/components/produtos/ProductCatalog";
import type { Product, Brand, Category } from "@/src/data/products";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ProdutosPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

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

  return <ProductCatalog initialProducts={mappedProducts} />;
}
