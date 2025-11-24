"use server";

import { db as prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schemas
const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const CreateOrderSchema = z.object({
  userId: z.string(),
  items: z.array(OrderItemSchema).min(1),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "OTHER"]),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export async function searchUsers(query: string) {
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

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return [];

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
      ],
      inStock: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
      price: true,
      imageUrl: true,
      brand: true,
    },
    take: 20,
  });

  return products;
}

export async function createAdminOrder(data: CreateOrderInput) {
  const result = CreateOrderSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const { userId, items, status, paymentMethod, notes, createdAt } = result.data;

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

    // Create order transaction
    const order = await prisma.$transaction(async (tx) => {
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
          addressLine1: user.addressLine1 || "",
          addressLine2: user.addressLine2,
          city: user.city || "",
          state: user.state || "",
          postalCode: user.postalCode || "",
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
    console.error("Error creating admin order:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro ao criar pedido" };
  }
}
