import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Papa from "papaparse";

interface CsvProductRow {
  code: string;
  name: string;
  price: string;
  brand?: string;
  category?: string;
  model?: string;
  imageUrl?: string;
  stockQuantity?: string;
  minStockThreshold?: string;
  description?: string;
  tags?: string;
  popularity?: string;
}

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

    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.error("CSV Parse Errors:", parseResult.errors);
      return NextResponse.json(
        { error: "Failed to parse CSV file", details: parseResult.errors },
        { status: 400 }
      );
    }

    const productsToUpsert = [];
    const errors = [];
    const data = parseResult.data as CsvProductRow[]; // Use the defined type here

    for (let i = 0; i < data.length; i++) {
      const productData = data[i]; // productData now has type CsvProductRow

      // Basic validation
      if (!productData.code || !productData.name || !productData.price) {
        errors.push(
          `Row ${i + 1}: Missing required fields (code, name, or price)`
        );
        continue;
      }

      const price = Number.parseFloat(productData.price);
      if (Number.isNaN(price)) {
        // Changed isNaN to Number.isNaN
        errors.push(
          `Row ${i + 1}: Invalid price for product ${productData.code}`
        );
        continue;
      }

      productsToUpsert.push({
        code: productData.code,
        name: productData.name,
        brand: productData.brand || "Generic",
        category: productData.category || "other",
        model: productData.model || "",
        imageUrl: productData.imageUrl || "/logo-iron.png",
        inStock: parseInt(productData.stockQuantity || "0") > 0,
        stockQuantity: parseInt(productData.stockQuantity || "0"),
        minStockThreshold: parseInt(productData.minStockThreshold || "10"),
        price: price,
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
            inStock: product.stockQuantity > 0,
            stockQuantity: product.stockQuantity,
            minStockThreshold: product.minStockThreshold,
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
