import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  // Verificar se é admin
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const search = searchParams.get("search") || "";
  const orderBy = searchParams.get("orderBy") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const skip = (page - 1) * limit;

  try {
    // Construir filtro base
    const whereConditions: Prisma.UserWhereInput = {};

    // Filtro por status
    if (status === "pending") {
      whereConditions.approved = false;
      whereConditions.role = "USER";
    } else if (status === "approved") {
      whereConditions.approved = true;
    }

    // Filtro de busca (nome, email, telefone, docNumber)
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { docNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Buscar total de registros (para paginação)
    const total = await db.user.count({ where: whereConditions });

    // Buscar usuários com paginação
    const users = await db.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        docNumber: true,
        storeName: true,
        role: true,
        approved: true,
        createdAt: true,
      },
      orderBy: {
        [orderBy]: order.toLowerCase(),
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error("admin/users:GET - Erro ao buscar usuários", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  // Verificar se é admin
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, approved } = body;

    if (!userId || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { approved },
      select: {
        id: true,
        name: true,
        email: true,
        approved: true,
      },
    });

    if (approved) {
      await db.notification.create({
        data: {
          userId: user.id,
          title: "Conta Aprovada",
          message:
            "Sua conta foi aprovada! Agora você pode visualizar preços e fazer pedidos.",
          link: "/",
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    logger.error("admin/users:PATCH - Erro ao atualizar usuário", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  // Verificar se é admin
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, name, email, phone, storeName } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nome deve ter pelo menos 2 caracteres" },
        { status: 400 }
      );
    }

    // Validação de email mais robusta
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Verificar se email já existe (excluindo o próprio usuário)
    const existingUser = await db.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso por outro usuário" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        storeName: storeName?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        storeName: true,
        docNumber: true,
        role: true,
        approved: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    logger.error("admin/users:PUT - Erro ao editar usuário", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Falha ao atualizar usuário" },
      { status: 500 }
    );
  }
}
