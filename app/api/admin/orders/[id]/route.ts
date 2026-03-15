import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { OrderStatus } from "@/types/order";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/admin/orders/[id]
 * Atualiza o status de um pedido (ADMIN apenas)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Verificar autenticação e permissão de admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    // Validar status
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // Verificar se o pedido existe
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status do pedido e estoque em uma transação
    const updatedOrder = await db.$transaction(async (tx) => {
      // Se o novo status for CONFIRMED e o anterior não era, deduzir estoque
      if (status === "CONFIRMED" && existingOrder.status !== "CONFIRMED") {
        // Buscar itens do pedido para saber quais produtos atualizar
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: id },
        });

        for (const item of orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stockQuantity: true },
          });

          if (!product) {
            logger.warn("admin/orders/[id]:PATCH - Produto não encontrado para item do pedido, pulando atualização de estoque", {
              productId: item.productId,
              orderItemId: item.id,
            });
            continue;
          }

          if (product.stockQuantity < item.quantity) {
            logger.warn("admin/orders/[id]:PATCH - Estoque insuficiente para dedução completa", {
              productId: item.productId,
              currentStock: product.stockQuantity,
              requestedQuantity: item.quantity,
            });
          }

          const newStock = Math.max(0, product.stockQuantity - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newStock,
              inStock: newStock > 0,
            },
          });
        }
      }

      // Atualizar o pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Criar notificação para o usuário
      await tx.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: "Atualização de Pedido",
          message: `Seu pedido #${updatedOrder.orderNumber} mudou para ${status}.`,
          link: `/meus-pedidos?orderId=${updatedOrder.id}`,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    logger.error("admin/orders/[id]:PATCH - Erro ao atualizar status do pedido", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao atualizar status do pedido" },
      { status: 500 }
    );
  }
}
