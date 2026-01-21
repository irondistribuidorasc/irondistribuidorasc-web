"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db as prisma } from "@/src/lib/prisma";

// Schemas
const OrderItemSchema = z.object({
	productId: z.string(),
	quantity: z.number().min(1),
	price: z.number().min(0),
});

const AddressSchema = z.object({
	addressLine1: z.string(),
	addressLine2: z.string().optional(),
	city: z.string(),
	state: z.string(),
	postalCode: z.string(),
});

const CreateOrderSchema = z.object({
	userId: z.string(),
	items: z.array(OrderItemSchema).min(1),
	status: z.enum([
		"PENDING",
		"CONFIRMED",
		"PROCESSING",
		"SHIPPED",
		"DELIVERED",
		"CANCELLED",
	]),
	paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "OTHER"]),
	notes: z.string().optional(),
	createdAt: z.date().optional(),
	address: AddressSchema.optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export async function searchUsers(query: string) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Não autorizado");
	}

	if (!query || query.length < 2) return [];

	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ name: { contains: query, mode: "insensitive" } },
				{ email: { contains: query, mode: "insensitive" } },
				{ storeName: { contains: query, mode: "insensitive" } },
			],
			role: "USER", // Only search for regular users
		},
		select: {
			id: true,
			name: true,
			email: true,
			storeName: true,
			docNumber: true,
			addressLine1: true,
			addressLine2: true,
			city: true,
			state: true,
			postalCode: true,
			phone: true,
		},
		take: 10,
	});

	return users;
}

export async function getRecentUsers() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Não autorizado");
	}

	// Buscar clientes que fizeram pedidos recentemente
	const users = await prisma.user.findMany({
		where: {
			role: "USER",
		},
		select: {
			id: true,
			name: true,
			email: true,
			storeName: true,
			docNumber: true,
			addressLine1: true,
			addressLine2: true,
			city: true,
			state: true,
			postalCode: true,
			phone: true,
		},
		orderBy: {
			updatedAt: "desc",
		},
		take: 5,
	});

	return users;
}

export async function searchProducts(query: string) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Não autorizado");
	}

	if (!query || query.length < 2) return [];

	const products = await prisma.product.findMany({
		where: {
			OR: [
				{ name: { contains: query, mode: "insensitive" } },
				{ code: { contains: query, mode: "insensitive" } },
			],
			inStock: true,
			stockQuantity: { gt: 0 },
		},
		select: {
			id: true,
			name: true,
			code: true,
			price: true,
			imageUrl: true,
			brand: true,
			stockQuantity: true,
		},
		take: 20,
	});

	return products;
}

export async function getPopularProducts() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Não autorizado");
	}

	// Buscar produtos populares com estoque
	const products = await prisma.product.findMany({
		where: {
			inStock: true,
			stockQuantity: { gt: 0 },
		},
		select: {
			id: true,
			name: true,
			code: true,
			price: true,
			imageUrl: true,
			brand: true,
			stockQuantity: true,
		},
		orderBy: {
			popularity: "desc",
		},
		take: 10,
	});

	return products;
}

export async function createQuickUser(name: string) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		return { success: false, error: "Não autorizado" };
	}

	const trimmedName = name.trim();
	if (!trimmedName || trimmedName.length < 2) {
		return { success: false, error: "Nome deve ter pelo menos 2 caracteres" };
	}

	try {
		// Gera email único fictício para clientes avulsos
		const uniqueEmail = `avulso_${Date.now()}@iron.local`;

		const user = await prisma.user.create({
			data: {
				name: trimmedName,
				email: uniqueEmail,
				role: "USER",
				approved: true, // Cliente avulso já fica aprovado
			},
			select: {
				id: true,
				name: true,
				email: true,
				storeName: true,
				phone: true,
				docNumber: true,
				addressLine1: true,
				addressLine2: true,
				city: true,
				state: true,
				postalCode: true,
			},
		});

		return { success: true, user };
	} catch (error) {
		logger.error(
			"admin-order-creation:createQuickUser - Erro ao criar cliente",
			{
				error: error instanceof Error ? error.message : String(error),
			},
		);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro ao criar cliente",
		};
	}
}

export async function createAdminOrder(data: CreateOrderInput) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		return { success: false, error: "Não autorizado" };
	}

	const result = CreateOrderSchema.safeParse(data);

	if (!result.success) {
		return { success: false, error: "Dados inválidos" };
	}

	const { userId, items, status, paymentMethod, notes, createdAt, address } =
		result.data;

	try {
		// Fetch user details for snapshot
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return { success: false, error: "Usuário não encontrado" };
		}

		// Fetch products to get details
		const productIds = items.map((i) => i.productId);
		const products = await prisma.product.findMany({
			where: { id: { in: productIds } },
		});

		const productMap = new Map(products.map((p) => [p.id, p]));

		// Calculate total and prepare items
		let calculatedTotal = 0;
		const orderItemsData = items.map((item) => {
			const product = productMap.get(item.productId);
			if (!product) {
				throw new Error(`Produto não encontrado: ${item.productId}`);
			}
			const itemTotal = item.price * item.quantity;
			calculatedTotal += itemTotal;

			return {
				productId: item.productId,
				productCode: product.code,
				productName: product.name,
				quantity: item.quantity,
				price: item.price,
				total: itemTotal,
			};
		});

		// Generate order number
		const orderNumber = `ADM-${Date.now().toString().slice(-8)}`;

		// Use provided address or fallback to user's address
		const orderAddress = {
			addressLine1: address?.addressLine1 || user.addressLine1 || "",
			addressLine2: address?.addressLine2 || user.addressLine2 || null,
			city: address?.city || user.city || "",
			state: address?.state || user.state || "",
			postalCode: address?.postalCode || user.postalCode || "",
		};

		// Create order and update user address in transaction
		const order = await prisma.$transaction(async (tx) => {
			// Se o endereço foi fornecido, atualiza o perfil do usuário para facilitar pedidos futuros
			if (address?.addressLine1) {
				await tx.user.update({
					where: { id: userId },
					data: {
						addressLine1: orderAddress.addressLine1,
						addressLine2: orderAddress.addressLine2,
						city: orderAddress.city,
						state: orderAddress.state,
						postalCode: orderAddress.postalCode,
					},
				});
			}

			return await tx.order.create({
				data: {
					userId,
					orderNumber,
					status,
					paymentMethod,
					total: calculatedTotal,
					notes,
					customerName: user.name,
					customerEmail: user.email,
					customerPhone: user.phone || "",
					customerDocNumber: user.docNumber,
					addressLine1: orderAddress.addressLine1,
					addressLine2: orderAddress.addressLine2,
					city: orderAddress.city,
					state: orderAddress.state,
					postalCode: orderAddress.postalCode,
					...(createdAt && { createdAt }), // Use custom date if provided
					items: {
						create: orderItemsData,
					},
				},
			});
		});

		revalidatePath("/admin/pedidos");
		return { success: true, orderId: order.id };
	} catch (error) {
		logger.error(
			"admin-order-creation:createAdminOrder - Erro ao criar pedido",
			{
				error: error instanceof Error ? error.message : String(error),
			},
		);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro ao criar pedido",
		};
	}
}
