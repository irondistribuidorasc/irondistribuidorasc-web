import { NextResponse } from "next/server";
import { hash } from "bcrypt";

import { db } from "@/src/lib/prisma";
import { logger } from "@/src/lib/logger";
import {
  isValidEmail,
  normalizeEmail,
  normalizeOptionalString,
  isValidPhone,
  isValidDocNumber,
  validatePassword,
  validateMaxLength,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_DOC_NUMBER_LENGTH,
} from "@/src/lib/validation";

// TODO: Implementar rate limiting para proteger contra brute force
// Sugestão: usar middleware com Redis ou biblioteca como @upstash/ratelimit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);
    const phone = normalizeOptionalString(body.phone);
    const docNumber = normalizeOptionalString(body.docNumber);
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "E-mail inválido." },
        { status: 400 }
      );
    }

    // Validação de comprimento máximo
    const maxLengthValidations = [
      validateMaxLength(name, MAX_NAME_LENGTH, "Nome"),
      validateMaxLength(phone, MAX_PHONE_LENGTH, "Telefone"),
      validateMaxLength(docNumber, MAX_DOC_NUMBER_LENGTH, "CPF/CNPJ"),
    ];

    for (const validation of maxLengthValidations) {
      if (!validation.valid) {
        return NextResponse.json(
          { message: validation.message },
          { status: 400 }
        );
      }
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      );
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { message: "Telefone inválido." },
        { status: 400 }
      );
    }

    if (docNumber && !isValidDocNumber(docNumber)) {
      return NextResponse.json(
        { message: "CPF/CNPJ inválido." },
        { status: 400 }
      );
    }

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
        phone,
        docNumber,
        hashedPassword,
      },
    });

    logger.info("register:POST - Usuário criado com sucesso", { userId: user.id, email });

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
