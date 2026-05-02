import { auth } from "@/src/lib/auth";
import {
  buildStockDeductionsForOrderItems,
  buildStockRestorationsForOrderItems,
  type AdminOrderStatus,
  shouldDeductStockForStatusTransition,
  shouldRestoreStockForStatusTransition,
} from "@/src/lib/admin-order-items";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { OrderStatus } from "@/types/order";
import { NextRequest, NextResponse } from "next/server";

class OrderNotFoundError extends Error {}

class OrderStatusConflictError extends Error {}

class OrderStockError extends Error {}

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

    // Atualizar status do pedido e estoque em uma transação
    const updatedOrder = await db.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id },
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

      if (!existingOrder) {
        throw new OrderNotFoundError("Pedido não encontrado");
      }

      const shouldDeductStock = shouldDeductStockForStatusTransition(
        existingOrder.status as AdminOrderStatus,
        status as AdminOrderStatus
      );
      const shouldRestoreStock = shouldRestoreStockForStatusTransition(
        existingOrder.status as AdminOrderStatus,
        status as AdminOrderStatus
      );

      let updatedOrder = existingOrder;

      if (shouldDeductStock || shouldRestoreStock) {
        const transitionClaim = await tx.order.updateMany({
          where: {
            id,
            status: existingOrder.status,
          },
          data: { status },
        });

        if (transitionClaim.count !== 1) {
          const currentOrder = await tx.order.findUnique({
            where: { id },
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

          if (currentOrder?.status === status) {
            return currentOrder;
          }

          throw new OrderStatusConflictError(
            "Status do pedido mudou durante a atualização"
          );
        }

        const products = await tx.product.findMany({
          where: {
            id: {
              in: existingOrder.items.map((item) => item.productId),
            },
          },
          select: {
            id: true,
            code: true,
            name: true,
            price: true,
            stockQuantity: true,
          },
        });

        if (shouldDeductStock) {
          const stockDeductions = buildStockDeductionsForOrderItems({
            items: existingOrder.items,
            products,
          });

          for (const deduction of stockDeductions) {
            const remainingStock = deduction.currentStock - deduction.quantity;
            const updateResult = await tx.product.updateMany({
              where: {
                id: deduction.productId,
                stockQuantity: { gte: deduction.quantity },
              },
              data: {
                stockQuantity: { decrement: deduction.quantity },
                inStock: remainingStock > 0,
              },
            });

            if (updateResult.count !== 1) {
              throw new OrderStockError(
                `Estoque insuficiente para ${deduction.productName ?? "produto"}`
              );
            }
          }
        }

        if (shouldRestoreStock) {
          const stockRestorations = buildStockRestorationsForOrderItems({
            items: existingOrder.items,
            products,
          });

          for (const restoration of stockRestorations) {
            const updateResult = await tx.product.updateMany({
              where: {
                id: restoration.productId,
              },
              data: {
                stockQuantity: { increment: restoration.quantity },
                inStock: true,
              },
            });

            if (updateResult.count !== 1) {
              throw new OrderStockError(
                `Falha ao restaurar estoque para ${restoration.productName ?? "produto"}`
              );
            }
          }
        }

        const refreshedOrder = await tx.order.findUnique({
          where: { id },
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

        if (!refreshedOrder) {
          throw new OrderNotFoundError("Pedido não encontrado");
        }

        updatedOrder = refreshedOrder;
      } else if (existingOrder.status !== status) {
        updatedOrder = await tx.order.update({
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
      }

      // Criar notificação para o usuário
      if (existingOrder.status !== updatedOrder.status) {
        await tx.notification.create({
          data: {
            userId: updatedOrder.userId,
            title: "Atualização de Pedido",
            message: `Seu pedido #${updatedOrder.orderNumber} mudou para ${status}.`,
            link: `/meus-pedidos?orderId=${updatedOrder.id}`,
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (
      error instanceof OrderStatusConflictError ||
      error instanceof OrderStockError ||
      (error instanceof Error &&
        (error.message.includes("Estoque insuficiente") ||
          error.message.includes("Produto não encontrado")))
    ) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Conflito de status" },
        { status: 409 }
      );
    }

    logger.error("admin/orders/[id]:PATCH - Erro ao atualizar status do pedido", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao atualizar status do pedido" },
      { status: 500 }
    );
  }
}
