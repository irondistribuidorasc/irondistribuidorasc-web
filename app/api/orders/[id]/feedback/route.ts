import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

/**
 * GET /api/orders/[id]/feedback
 * Busca o feedback de um pedido específico
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const order = await db.order.findUnique({
			where: { id },
			select: {
				userId: true,
				feedback: true,
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

		return NextResponse.json(order.feedback);
	} catch (error) {
		console.error("Error fetching feedback:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar avaliação" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/orders/[id]/feedback
 * Cria ou atualiza o feedback de um pedido
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const body = await req.json();
		const { rating, comment } = body;

		// Validar rating (aceita string ou number do JSON)
		const ratingNum = Number(rating);
		if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
			return NextResponse.json(
				{ error: "Avaliação deve ser um número inteiro entre 1 e 5" },
				{ status: 400 },
			);
		}

		// Validar comentário
		if (comment && typeof comment !== "string") {
			return NextResponse.json(
				{ error: "Comentário deve ser uma string" },
				{ status: 400 },
			);
		}

		if (comment && comment.length > 500) {
			return NextResponse.json(
				{ error: "Comentário deve ter no máximo 500 caracteres" },
				{ status: 400 },
			);
		}

		// Buscar pedido
		const order = await db.order.findUnique({
			where: { id },
			select: {
				id: true,
				userId: true,
				status: true,
				feedback: true,
			},
		});

		if (!order) {
			return NextResponse.json(
				{ error: "Pedido não encontrado" },
				{ status: 404 },
			);
		}

		// Verificar se o pedido pertence ao usuário
		if (order.userId !== session.user.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
		}

		// Verificar se o pedido foi entregue
		if (order.status !== "DELIVERED") {
			return NextResponse.json(
				{ error: "Somente pedidos entregues podem ser avaliados" },
				{ status: 400 },
			);
		}

		// Criar ou atualizar feedback
		const feedback = await db.orderFeedback.upsert({
			where: { orderId: id },
			create: {
				orderId: id,
				rating: ratingNum,
				comment: comment || null,
			},
			update: {
				rating: ratingNum,
				comment: comment || null,
			},
		});

		return NextResponse.json(feedback, { status: 201 });
	} catch (error) {
		console.error("Error creating feedback:", error);
		return NextResponse.json(
			{ error: "Erro ao enviar avaliação" },
			{ status: 500 },
		);
	}
}
