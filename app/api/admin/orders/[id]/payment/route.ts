import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { validateCsrfOrigin } from "@/src/lib/csrf";
import { logger } from "@/src/lib/logger";
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
		const csrfResponse = validateCsrfOrigin(req);
		if (csrfResponse) {
			return csrfResponse;
		}

		const session = await auth();
		const { id } = await params;

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
		}

		const body = await req.json();
		const validation = updatePaymentSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Método de pagamento inválido" },
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
		logger.error("admin/orders/[id]/payment:PATCH - Erro ao atualizar método de pagamento", {
			error: error instanceof Error ? error.message : String(error),
		});
		return NextResponse.json(
			{ error: "Erro ao atualizar método de pagamento" },
			{ status: 500 },
		);
	}
}
