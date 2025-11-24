import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { z } from "zod";

const updatePaymentSchema = z.object({
	paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "OTHER"]),
});

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		const { id } = await params;

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const validation = updatePaymentSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid payment method" },
				{ status: 400 },
			);
		}

		const order = await db.order.update({
			where: { id },
			data: {
				paymentMethod: validation.data.paymentMethod,
			},
		});

		return NextResponse.json(order);
	} catch (error) {
		console.error("Error updating payment method:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
