import { auth } from "@/src/lib/auth";
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
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
            select: {
              stockQuantity: true,
            },
          });

          // Se o estoque zerou ou ficou negativo, marcar como sem estoque
          if (updatedProduct.stockQuantity <= 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { inStock: false },
            });
          }
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
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do pedido" },
      { status: 500 }
    );
  }
}
