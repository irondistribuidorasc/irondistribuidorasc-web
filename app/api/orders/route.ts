import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

/**
 * GET /api/orders
 * Lista todos os pedidos do usuário autenticado
 */
export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const orders = await db.order.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				items: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar pedidos" },
			{ status: 500 },
		);
	}
}
