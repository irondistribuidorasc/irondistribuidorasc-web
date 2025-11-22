import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();

  // Verificar se é admin
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const orderBy = searchParams.get("orderBy") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const skip = (page - 1) * limit;

  try {
    // Construir filtro base
    const whereConditions: any = {};

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
    console.error("Error fetching users:", error);
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
