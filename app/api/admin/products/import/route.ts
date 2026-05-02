import { NextResponse } from "next/server";
import Papa from "papaparse";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import {
  normalizeImportedProductRow,
  type ImportedProductData,
  type ImportedProductRow,
} from "@/src/lib/productImport";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";

// Constantes de validação de upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["text/csv", "application/csv", "text/plain"];

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const clientIP = getClientIP(request);
    const rateLimitResponse = await withRateLimit(clientIP, "sensitiveAction");
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
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
        { error: "Erro ao processar arquivo CSV", errorCount: parseResult.errors.length },
        { status: 400 }
      );
    }

    const productsToUpsert: ImportedProductData[] = [];
    const errors: string[] = [];
    const data = parseResult.data as ImportedProductRow[];

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
      const normalizedProduct = normalizeImportedProductRow(data[i], i + 1);
      if ("error" in normalizedProduct) {
        errors.push(normalizedProduct.error);
        continue;
      }

      productsToUpsert.push(normalizedProduct.product);
    }

    let successCount = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
      const batch = productsToUpsert.slice(i, i + BATCH_SIZE);

      try {
        await db.$transaction(
          batch.map((product) =>
            db.product.upsert({
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
            })
          )
        );
        successCount += batch.length;
      } catch (batchErr) {
        logger.warn("admin/products/import - Batch falhou, tentando inserção individual", {
          batchStart: i,
          batchSize: batch.length,
          error: batchErr instanceof Error ? batchErr.message : String(batchErr),
        });
        for (const product of batch) {
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
          } catch (itemErr) {
            logger.error("admin/products/import - Erro ao importar produto individual", {
              code: product.code,
              error: itemErr instanceof Error ? itemErr.message : String(itemErr),
            });
            errors.push(`Falha ao importar produto ${product.code}`);
          }
        }
      }
    }

    logger.info("admin/products/import - Importação concluída", {
      successCount,
      errorCount: errors.length,
      totalRows: data.length,
    });

    return NextResponse.json({
      message: `${successCount} produtos importados com sucesso`,
      errors,
    });
  } catch (error) {
    logger.error("admin/products/import - Erro na importação", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao importar produtos" },
      { status: 500 }
    );
  }
}
