import { PrismaClient } from "@prisma/client";
import { products } from "../src/data/products";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        model: product.model,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        restockDate: product.restockDate ? new Date(product.restockDate) : null,
        price: product.price,
        description: product.description,
        tags: product.tags || [],
        popularity: product.popularity || 0,
      },
      create: {
        id: product.id,
        code: product.code,
        name: product.name,
        brand: product.brand,
        category: product.category,
        model: product.model,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        restockDate: product.restockDate ? new Date(product.restockDate) : null,
        price: product.price,
        description: product.description,
        tags: product.tags || [],
        popularity: product.popularity || 0,
      },
    });
  }

  console.log("Products seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
