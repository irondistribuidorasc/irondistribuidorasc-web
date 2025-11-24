import { NextResponse } from "next/server";

import { db } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import {
  normalizeOptionalString,
  isValidPhone,
  isValidDocNumber,
  isValidPostalCode,
  isValidState,
  validateMaxLength,
  MAX_NAME_LENGTH,
  MAX_ADDRESS_LENGTH,
  MAX_CITY_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_DOC_NUMBER_LENGTH,
} from "@/src/lib/validation";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      logger.warn("profile:PATCH - Tentativa de atualização sem autenticação");
      return NextResponse.json(
        { message: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

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
    } = body as Partial<{
      name: string;
      phone: string;
      docNumber: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      storeName: string;
      storePhone: string;
      tradeLicense: string;
    }>;

    const normalizedPhone = normalizeOptionalString(phone);
    const normalizedDocNumber = normalizeOptionalString(docNumber);
    const normalizedAddressLine1 = normalizeOptionalString(addressLine1);
    const normalizedAddressLine2 = normalizeOptionalString(addressLine2);
    const normalizedCity = normalizeOptionalString(city);
    const normalizedState = state ? normalizeOptionalString(state.toUpperCase()) : null;
    const normalizedPostalCode = normalizeOptionalString(postalCode);
    const normalizedName = name ? name.trim() : undefined;
    const normalizedStoreName = normalizeOptionalString(storeName);
    const normalizedStorePhone = normalizeOptionalString(storePhone);
    const normalizedTradeLicense = normalizeOptionalString(tradeLicense);

    // Validação de comprimento máximo
    const maxLengthValidations = [
      validateMaxLength(normalizedName, MAX_NAME_LENGTH, "Nome"),
      validateMaxLength(normalizedPhone, MAX_PHONE_LENGTH, "Telefone"),
      validateMaxLength(normalizedDocNumber, MAX_DOC_NUMBER_LENGTH, "CPF/CNPJ"),
      validateMaxLength(normalizedAddressLine1, MAX_ADDRESS_LENGTH, "Endereço linha 1"),
      validateMaxLength(normalizedAddressLine2, MAX_ADDRESS_LENGTH, "Endereço linha 2"),
      validateMaxLength(normalizedCity, MAX_CITY_LENGTH, "Cidade"),
      validateMaxLength(normalizedPostalCode, MAX_POSTAL_CODE_LENGTH, "CEP"),
      validateMaxLength(normalizedStoreName, MAX_NAME_LENGTH, "Nome da loja"),
      validateMaxLength(normalizedStorePhone, MAX_PHONE_LENGTH, "Telefone comercial"),
      validateMaxLength(normalizedTradeLicense, MAX_DOC_NUMBER_LENGTH, "Inscrição"),
    ];

    for (const validation of maxLengthValidations) {
      if (!validation.valid) {
        return NextResponse.json(
          { message: validation.message },
          { status: 400 }
        );
      }
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return NextResponse.json(
        { message: "Telefone inválido." },
        { status: 400 }
      );
    }

    if (normalizedDocNumber && !isValidDocNumber(normalizedDocNumber)) {
      return NextResponse.json(
        { message: "CPF/CNPJ inválido." },
        { status: 400 }
      );
    }

    if (normalizedStorePhone && !isValidPhone(normalizedStorePhone)) {
      return NextResponse.json(
        { message: "Telefone comercial inválido." },
        { status: 400 }
      );
    }

    if (normalizedPostalCode && !isValidPostalCode(normalizedPostalCode)) {
      return NextResponse.json(
        { message: "CEP inválido." },
        { status: 400 }
      );
    }

    if (normalizedState && !isValidState(normalizedState)) {
      return NextResponse.json(
        { message: "Estado inválido. Use a sigla de 2 letras (ex: SC, SP)." },
        { status: 400 }
      );
    }

    const data: Record<string, string | null | undefined> = {
      ...(normalizedName !== undefined && { name: normalizedName }),
      ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
      ...(normalizedDocNumber !== undefined && { docNumber: normalizedDocNumber }),
      ...(normalizedAddressLine1 !== undefined && { addressLine1: normalizedAddressLine1 }),
      ...(normalizedAddressLine2 !== undefined && { addressLine2: normalizedAddressLine2 }),
      ...(normalizedCity !== undefined && { city: normalizedCity }),
      ...(normalizedState !== undefined && { state: normalizedState }),
      ...(normalizedPostalCode !== undefined && { postalCode: normalizedPostalCode }),
      ...(normalizedStoreName !== undefined && { storeName: normalizedStoreName }),
      ...(normalizedStorePhone !== undefined && { storePhone: normalizedStorePhone }),
      ...(normalizedTradeLicense !== undefined && { tradeLicense: normalizedTradeLicense }),
    };

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "Nenhuma alteração enviada." }, { status: 200 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data,
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

    logger.info("profile:PATCH - Perfil atualizado com sucesso", { userId: user.id });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    logger.error("profile:PATCH - Erro ao atualizar perfil", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { message: "Não foi possível atualizar seus dados." },
      { status: 500 }
    );
  }
}
