import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = await params;

    const product = await db.product.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        brand: body.brand,
        category: body.category,
        model: body.model,
        imageUrl: body.imageUrl,

        inStock: (body.stockQuantity ?? 0) > 0,
        stockQuantity: Number.isNaN(Number(body.stockQuantity))
          ? undefined
          : Number(body.stockQuantity),
        minStockThreshold: Number.isNaN(Number(body.minStockThreshold))
          ? undefined
          : Number(body.minStockThreshold),
        restockDate: body.restockDate ? new Date(body.restockDate) : null,
        price: Number.isNaN(Number(body.price))
          ? undefined
          : Number(body.price),
        description: body.description,
        tags: body.tags,
        popularity: Number.isNaN(Number(body.popularity))
          ? undefined
          : Number(body.popularity),
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
