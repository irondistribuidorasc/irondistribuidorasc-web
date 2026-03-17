import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";
import { productSchema } from "@/src/lib/schemas";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const clientIP = getClientIP(request);
    const rateLimitResponse = await withRateLimit(clientIP, "api");
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { id } = await params;

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const product = await db.product.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        brand: data.brand,
        category: data.category,
        model: data.model,
        imageUrl: data.imageUrl,
        inStock: data.stockQuantity > 0,
        stockQuantity: data.stockQuantity,
        minStockThreshold: data.minStockThreshold,
        restockDate: data.restockDate ? new Date(data.restockDate) : null,
        price: data.price,
        description: data.description,
        tags: data.tags,
        popularity: data.popularity,
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      logger.warn("admin/products/[id]:PUT - Conflito de código duplicado", {
        error: error.message,
      });
      return NextResponse.json(
        { error: "Já existe um produto com este código" },
        { status: 409 }
      );
    }

    logger.error("admin/products/[id]:PUT - Erro ao atualizar produto", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const clientIP = getClientIP(request);
    const rateLimitResponse = await withRateLimit(clientIP, "sensitiveAction");
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    logger.error("admin/products/[id]:DELETE - Erro ao excluir produto", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
