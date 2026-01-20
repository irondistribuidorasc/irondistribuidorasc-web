import { authOptions } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Papa from "papaparse";

// Constantes de validação de upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["text/csv", "application/csv", "text/plain"];

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

    // Validar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      logger.warn("admin/products/import - Arquivo muito grande", {
        size: file.size,
        maxSize: MAX_FILE_SIZE,
      });
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Validar tipo MIME
    // Nota: alguns navegadores reportam text/plain para CSV, então aceitamos também
    const fileType = file.type || "text/plain";
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      // Verificar também pela extensão como fallback
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".csv")) {
        logger.warn("admin/products/import - Tipo de arquivo inválido", {
          type: fileType,
          name: file.name,
        });
        return NextResponse.json(
          { error: "Tipo de arquivo inválido. Apenas arquivos CSV são aceitos." },
          { status: 400 }
        );
      }
    }

    const text = await file.text();

    // Validar se o arquivo não está vazio
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Arquivo CSV está vazio" },
        { status: 400 }
      );
    }

    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      logger.warn("admin/products/import - Erros no parse do CSV", {
        errors: parseResult.errors.slice(0, 5), // Limitar para não logar muito
      });
      return NextResponse.json(
        { error: "Failed to parse CSV file", details: parseResult.errors },
        { status: 400 }
      );
    }

    const productsToUpsert = [];
    const errors = [];
    const data = parseResult.data as CsvProductRow[];

    // Limitar número de produtos por importação para evitar sobrecarga
    const MAX_PRODUCTS_PER_IMPORT = 1000;
    if (data.length > MAX_PRODUCTS_PER_IMPORT) {
      return NextResponse.json(
        {
          error: `Número máximo de produtos por importação: ${MAX_PRODUCTS_PER_IMPORT}. Seu arquivo tem ${data.length} linhas.`,
        },
        { status: 400 }
      );
    }

    for (let i = 0; i < data.length; i++) {
      const productData = data[i];

      // Basic validation
      if (!productData.code || !productData.name || !productData.price) {
        errors.push(
          `Row ${i + 1}: Missing required fields (code, name, or price)`
        );
        continue;
      }

      const price = Number.parseFloat(productData.price);
      if (Number.isNaN(price)) {
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
        logger.error("admin/products/import - Erro ao importar produto", {
          code: product.code,
          error: err instanceof Error ? err.message : String(err),
        });
        errors.push(`Failed to import product ${product.code}`);
      }
    }

    logger.info("admin/products/import - Importação concluída", {
      successCount,
      errorCount: errors.length,
      totalRows: data.length,
    });

    return NextResponse.json({
      message: `Imported ${successCount} products successfully`,
      errors,
    });
  } catch (error) {
    logger.error("admin/products/import - Erro na importação", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    );
  }
}
