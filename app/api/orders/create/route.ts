import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

interface CreateOrderItem {
	productId: string;
	productCode: string;
	productName: string;
	quantity: number;
	price: number;
}

interface CreateOrderPayload {
	items: CreateOrderItem[];
	customer: {
		name: string;
		email: string;
		phone: string;
		docNumber?: string;
		addressLine1: string;
		addressLine2?: string;
		city: string;
		state: string;
		postalCode: string;
	};
	notes?: string;
}

/**
 * POST /api/orders/create
 * Cria um novo pedido quando o usuário finaliza via WhatsApp
 */
export async function POST(req: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		// Verificar se o usuário está aprovado
		if (!session.user.approved) {
			return NextResponse.json(
				{ error: "Usuário não aprovado" },
				{ status: 403 },
			);
		}

		const payload: CreateOrderPayload = await req.json();

		// Validações básicas
		if (!payload.items || payload.items.length === 0) {
			return NextResponse.json(
				{ error: "Pedido deve conter ao menos um item" },
				{ status: 400 },
			);
		}

		if (!payload.customer) {
			return NextResponse.json(
				{ error: "Dados do cliente são obrigatórios" },
				{ status: 400 },
			);
		}

		// Buscar produtos no banco para garantir preços corretos
		const productIds = payload.items.map((item) => item.productId);
		const dbProducts = await db.product.findMany({
			where: {
				id: {
					in: productIds,
				},
			},
			select: {
				id: true,
				price: true,
				name: true,
				code: true,
			},
		});

		const productsMap = new Map(dbProducts.map((p) => [p.id, p]));

		// Validar se todos os produtos existem e recalcular itens
		const orderItems = [];
		let total = 0;

		for (const item of payload.items) {
			const dbProduct = productsMap.get(item.productId);

			if (!dbProduct) {
				return NextResponse.json(
					{ error: `Produto não encontrado: ${item.productName}` },
					{ status: 400 },
				);
			}

			// Usar preço do banco de dados
			const itemTotal = dbProduct.price * item.quantity;
			total += itemTotal;

			orderItems.push({
				productId: dbProduct.id,
				productCode: dbProduct.code,
				productName: dbProduct.name,
				quantity: item.quantity,
				price: dbProduct.price, // Preço oficial do banco
				total: itemTotal,
			});
		}

		// Gerar número sequencial do pedido
		const lastOrder = await db.order.findFirst({
			orderBy: {
				createdAt: "desc",
			},
			select: {
				orderNumber: true,
			},
		});

		let orderNumber = "1001";
		if (lastOrder?.orderNumber) {
			const lastNumber = parseInt(lastOrder.orderNumber, 10);
			orderNumber = (lastNumber + 1).toString();
		}

		// Criar pedido com items
		const order = await db.order.create({
			data: {
				userId: session.user.id,
				orderNumber,
				status: "PENDING",
				total,
				customerName: payload.customer.name,
				customerEmail: payload.customer.email,
				customerPhone: payload.customer.phone,
				customerDocNumber: payload.customer.docNumber || null,
				addressLine1: payload.customer.addressLine1,
				addressLine2: payload.customer.addressLine2 || null,
				city: payload.customer.city,
				state: payload.customer.state,
				postalCode: payload.customer.postalCode,
				notes: payload.notes || null,
				whatsappMessageSent: true,
				items: {
					create: orderItems,
				},
			},
			include: {
				items: true,
			},
		});

		return NextResponse.json(order, { status: 201 });
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ error: "Erro ao criar pedido" },
			{ status: 500 },
		);
	}
}
