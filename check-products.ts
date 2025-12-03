import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count();
    console.log(`Total products in database: ${count}`);

    if (count > 0) {
      const products = await prisma.product.findMany({ take: 5 });
      console.log(
        "First 5 products:",
        products.map((p) => p.name)
      );
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
