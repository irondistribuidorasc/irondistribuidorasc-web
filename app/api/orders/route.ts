import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/orders
 * Lista todos os pedidos do usuário autenticado
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        paymentMethod: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        addressLine1: true,
        city: true,
        state: true,
        postalCode: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
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
        feedback: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    logger.error("orders:GET - Erro ao buscar pedidos", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}
