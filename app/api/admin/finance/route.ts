import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import {
	buildFinancialSummary,
	FINANCIAL_ORDER_STATUSES,
} from "@/src/lib/finance-summary";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
		}

		const { searchParams } = new URL(req.url);
		const dateParam = searchParams.get("date");

		const date = dateParam ? parseISO(dateParam) : new Date();
		const startDate = startOfDay(date);
		const endDate = endOfDay(date);

		const orders = await db.order.findMany({
			where: {
				createdAt: {
					gte: startDate,
					lte: endDate,
				},
				status: {
					in: [...FINANCIAL_ORDER_STATUSES],
				},
			},
			select: {
				id: true,
				orderNumber: true,
				customerName: true,
				total: true,
				paymentMethod: true,
				createdAt: true,
				status: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const summary = buildFinancialSummary(orders);

		return NextResponse.json({
			orders,
			summary,
		});
	} catch (error) {
		logger.error("admin/finance:GET - Erro ao buscar dados financeiros", {
			error: error instanceof Error ? error.message : String(error),
		});
		return NextResponse.json(
			{ error: "Erro ao buscar dados financeiros" },
			{ status: 500 },
		);
	}
}
