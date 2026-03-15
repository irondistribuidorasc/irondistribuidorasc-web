import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { orderFeedbackSchema } from "@/src/lib/schemas";

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
		logger.error("orders/[id]/feedback:GET - Erro ao buscar avaliação", { error: error instanceof Error ? error.message : String(error) });
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
		const validation = orderFeedbackSchema.safeParse(body);

		if (!validation.success) {
			const firstError = validation.error.issues[0];
			return NextResponse.json(
				{ error: firstError.message },
				{ status: 400 },
			);
		}

		const { rating: ratingNum, comment } = validation.data;

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
		logger.error("orders/[id]/feedback:POST - Erro ao enviar avaliação", { error: error instanceof Error ? error.message : String(error) });
		return NextResponse.json(
			{ error: "Erro ao enviar avaliação" },
			{ status: 500 },
		);
	}
}
