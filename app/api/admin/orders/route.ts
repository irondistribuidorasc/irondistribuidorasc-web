import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { OrderStatus } from "@/types/order";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/orders
 * Lista todos os pedidos (ADMIN apenas) com filtros e paginação
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticação e permissão de admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Extrair parâmetros de query
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") as OrderStatus | "all" | null;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const orderBy = searchParams.get("orderBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Construir filtros
    const where: Prisma.OrderWhereInput = {};

    // Filtro por status
    if (status && status !== "all") {
      where.status = status;
    }

    // Filtro de busca (order number, customer name, email, phone)
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Buscar total de registros
    const total = await db.order.count({ where });

    // Buscar pedidos com paginação
    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        [orderBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}
