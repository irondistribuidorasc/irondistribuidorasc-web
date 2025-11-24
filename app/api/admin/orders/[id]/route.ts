import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { OrderStatus } from "@/types/order";

/**
 * PATCH /api/admin/orders/[id]
 * Atualiza o status de um pedido (ADMIN apenas)
 */
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
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
				{ status: 404 },
			);
		}

		// Atualizar status do pedido
		const updatedOrder = await db.order.update({
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

		return NextResponse.json(updatedOrder);
	} catch (error) {
		console.error("Error updating order status:", error);
		return NextResponse.json(
			{ error: "Erro ao atualizar status do pedido" },
			{ status: 500 },
		);
	}
}
