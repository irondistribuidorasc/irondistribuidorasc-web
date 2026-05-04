import { auth } from "@/src/lib/auth";
import { validateCsrfOrigin } from "@/src/lib/csrf";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";
import { createOrderSchema } from "@/src/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/orders/create
 * Cria um novo pedido quando o usuário finaliza via WhatsApp
 */
export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateLimitResponse = await withRateLimit(clientIP, "api");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const csrfResponse = validateCsrfOrigin(req);
    if (csrfResponse) {
      return csrfResponse;
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se o usuário está aprovado
    if (!session.user.approved) {
      return NextResponse.json(
        { error: "Usuário não aprovado" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const payload = validation.data;

    // Buscar produtos no banco para garantir preços corretos e validar estoque
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
        stockQuantity: true,
      },
    });

    const productsMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validar estoque antes de processar o pedido
    const stockErrors: string[] = [];
    for (const item of payload.items) {
      const dbProduct = productsMap.get(item.productId);
      if (dbProduct && item.quantity > dbProduct.stockQuantity) {
        stockErrors.push(
          `${dbProduct.name}: solicitado ${item.quantity}, disponível ${dbProduct.stockQuantity}`
        );
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Estoque insuficiente",
          details: stockErrors,
        },
        { status: 400 }
      );
    }

    // Validar se todos os produtos existem e recalcular itens
    const orderItems = [];
    let total = 0;

    for (const item of payload.items) {
      const dbProduct = productsMap.get(item.productId);

      if (!dbProduct) {
        return NextResponse.json(
          { error: `Produto não encontrado: ${item.productName}` },
          { status: 400 }
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

    // Gerar número sequencial do pedido via sequence PostgreSQL (atômico)
    const seqResult = await db.$queryRaw<{ nextval: bigint }[]>`
      SELECT nextval('order_number_seq') as nextval
    `;
    const orderNumber = seqResult[0].nextval.toString();

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
        paymentMethod:
          (payload.paymentMethod as
            | "PIX"
            | "CREDIT_CARD"
            | "DEBIT_CARD"
            | "CASH"
            | "OTHER") || "OTHER",
        whatsappMessageSent: true,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    logger.info("orders/create - Pedido criado com sucesso", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: session.user.id,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    logger.error("orders/create - Erro ao criar pedido", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Erro ao criar pedido",
      },
      { status: 500 }
    );
  }
}
