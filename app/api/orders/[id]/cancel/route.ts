import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        items: {
          select: {
            id: true,
            productId: true,
            productCode: true,
            productName: true,
            quantity: true,
            price: true,
            total: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Verify ownership
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Verify status
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Apenas pedidos pendentes podem ser cancelados" }, { status: 400 });
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            productCode: true,
            productName: true,
            quantity: true,
            price: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    logger.error("orders/cancel - Erro ao cancelar pedido", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Erro ao cancelar pedido" }, { status: 500 });
  }
}
