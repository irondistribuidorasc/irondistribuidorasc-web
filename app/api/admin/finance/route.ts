import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
					not: "CANCELLED",
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

		// Calculate totals
		const summary = {
			total: 0,
			pix: 0,
			creditCard: 0,
			debitCard: 0,
			cash: 0,
			other: 0,
		};

		for (const order of orders) {
			summary.total += order.total;
			switch (order.paymentMethod) {
				case "PIX":
					summary.pix += order.total;
					break;
				case "CREDIT_CARD":
					summary.creditCard += order.total;
					break;
				case "DEBIT_CARD":
					summary.debitCard += order.total;
					break;
				case "CASH":
					summary.cash += order.total;
					break;
				default:
					summary.other += order.total;
			}
		}

		return NextResponse.json({
			orders,
			summary,
		});
	} catch (error) {
		console.error("Error fetching financial data:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
