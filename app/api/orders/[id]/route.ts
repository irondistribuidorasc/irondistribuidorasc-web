import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";

/**
 * GET /api/orders/[id]
 * Busca detalhes de um pedido específico
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const order = await db.order.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				userId: true,
				orderNumber: true,
				status: true,
				total: true,
				paymentMethod: true,
				customerName: true,
				customerEmail: true,
				customerPhone: true,
				customerDocNumber: true,
				addressLine1: true,
				addressLine2: true,
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
		});

		if (!order) {
			return NextResponse.json(
				{ error: "Pedido não encontrado" },
				{ status: 404 },
			);
		}

		// Verificar se o pedido pertence ao usuário ou se é admin
		if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
		}

		return NextResponse.json(order);
	} catch (error) {
		logger.error("orders/[id]:GET - Erro ao buscar pedido", { error: error instanceof Error ? error.message : String(error) });
		return NextResponse.json(
			{ error: "Erro ao buscar pedido" },
			{ status: 500 },
		);
	}
}
