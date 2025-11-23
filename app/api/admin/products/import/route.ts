
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const productsToUpsert = [];
    const errors = [];

    // Start from index 1 to skip headers
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const productData: any = {};

      headers.forEach((header, index) => {
        productData[header] = values[index];
      });

      // Basic validation
      if (!productData.code || !productData.name || !productData.price) {
        errors.push(`Line ${i + 1}: Missing required fields`);
        continue;
      }

      productsToUpsert.push({
        code: productData.code,
        name: productData.name,
        brand: productData.brand || "Generic",
        category: productData.category || "other",
        model: productData.model || "",
        imageUrl: productData.imageUrl || "/logo-iron.png",
        inStock: productData.inStock === "true" || productData.inStock === "1",
        price: parseFloat(productData.price),
        description: productData.description || "",
        tags: productData.tags ? productData.tags.split(";") : [],
        popularity: parseInt(productData.popularity || "0"),
      });
    }

    let successCount = 0;
    for (const product of productsToUpsert) {
      try {
        await db.product.upsert({
          where: { code: product.code },
          update: {
            name: product.name,
            brand: product.brand,
            category: product.category,
            model: product.model,
            imageUrl: product.imageUrl,
            inStock: product.inStock,
            price: product.price,
            description: product.description,
            tags: product.tags,
            popularity: product.popularity,
          },
          create: product,
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to upsert product ${product.code}:`, err);
        errors.push(`Failed to import product ${product.code}`);
      }
    }

    return NextResponse.json({
      message: `Imported ${successCount} products successfully`,
      errors,
    });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    );
  }
}
