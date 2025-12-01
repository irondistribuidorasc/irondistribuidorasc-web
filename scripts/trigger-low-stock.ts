import { db } from "@/src/lib/prisma";

async function triggerLowStock() {
  console.log("Triggering low stock event...");

  // Find a product that has stock > 10 (threshold)
  const product = await db.product.findFirst({
    where: {
      stockQuantity: { gt: 10 },
    },
  });

  if (!product) {
    console.log("No suitable product found to lower stock. Creating one.");
    const newProduct = await db.product.create({
      data: {
        code: `TEST-STOCK-${Date.now()}`,
        name: "Test Product for Notification",
        brand: "Test Brand",
        category: "Test Category",
        model: "Test Model",
        imageUrl: "https://example.com/image.jpg",
        price: 100,
        stockQuantity: 5, // Already low
        minStockThreshold: 10,
        inStock: true,
      },
    });
    console.log(`Created low stock product: ${newProduct.name}`);
  } else {
    console.log(
      `Updating product: ${product.name} (Current Stock: ${product.stockQuantity})`
    );
    // Update to low stock
    await db.product.update({
      where: { id: product.id },
      data: { stockQuantity: 5 },
    });
    console.log("Product updated to stock: 5 (Low Stock)");
  }
}

triggerLowStock()
  .catch((e) => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });
