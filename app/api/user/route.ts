import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { userProfileSchema } from "@/src/lib/schemas/user";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        docNumber: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        storeName: true,
        storePhone: true,
        tradeLicense: true,
        role: true,
        approved: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    logger.error("user:GET - Erro ao buscar perfil", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao buscar perfil do usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const result = userProfileSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      docNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      storeName,
      storePhone,
      tradeLicense,
    } = result.data;

    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        docNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        storeName,
        storePhone,
        tradeLicense,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        docNumber: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        storeName: true,
        storePhone: true,
        tradeLicense: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error("user:PATCH - Erro ao atualizar perfil", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erro ao atualizar perfil do usuário" },
      { status: 500 }
    );
  }
}
