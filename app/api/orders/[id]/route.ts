import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
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
			include: {
				items: true,
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
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar pedido" },
			{ status: 500 },
		);
	}
}
