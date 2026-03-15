import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";
import { bulkUpdateSchema } from "@/src/lib/schemas";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const clientIP = getClientIP(request);
  const rateLimitResponse = await withRateLimit(clientIP, "api");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = bulkUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { updates } = parsed.data;

    const results = await Promise.allSettled(
      updates.map(async (update) => {
        const dataToUpdate: Prisma.ProductUpdateInput = {};

        if (update.stockQuantity !== undefined) {
          dataToUpdate.stockQuantity = update.stockQuantity;
          dataToUpdate.inStock = update.stockQuantity > 0;
        }
        if (update.minStockThreshold !== undefined) {
          dataToUpdate.minStockThreshold = update.minStockThreshold;
        }

        if (Object.keys(dataToUpdate).length === 0) return null;

        return db.product.update({
          where: { id: update.id },
          data: dataToUpdate,
        });
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      logger.error("admin/products/bulk:PATCH - Erros na atualização em lote", {
        errorCount: errors.length,
      });
    }

    return NextResponse.json({
      message: `${successCount} produtos atualizados`,
      successCount,
      errorCount: errors.length,
    });
  } catch (error) {
    logger.error("admin/products/bulk:PATCH - Erro na atualização em lote", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao atualizar produtos" },
      { status: 500 }
    );
  }
}
