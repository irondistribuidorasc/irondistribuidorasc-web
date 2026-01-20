import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";
import { registerApiSchema } from "@/src/lib/schemas";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(request);
    const rateLimitResponse = await withRateLimit(clientIP, "auth");
    if (rateLimitResponse) {
      logger.warn("register:POST - Rate limit excedido", { ip: clientIP });
      return rateLimitResponse;
    }

    const body = await request.json();

    // Validação com Zod
    const validationResult = registerApiSchema.safeParse(body);

    if (!validationResult.success) {
      // Retorna o primeiro erro encontrado
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { message: firstError.message },
        { status: 400 }
      );
    }

    const { name, email, phone, docNumber, password } = validationResult.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn("register:POST - Email já cadastrado", { email });
      return NextResponse.json(
        { message: "Já existe uma conta com este e-mail." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        docNumber: docNumber || null,
        hashedPassword,
      },
    });

    logger.info("register:POST - Usuário criado com sucesso", {
      userId: user.id,
      email,
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        docNumber: user.docNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("register:POST - Erro ao criar usuário", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { message: "Não foi possível completar o cadastro." },
      { status: 500 }
    );
  }
}
