import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";
import { passwordSchema } from "@/src/lib/schemas";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(request);
    const rateLimitResponse = await withRateLimit(clientIP, "auth");
    if (rateLimitResponse) {
      logger.warn("reset-password:POST - Rate limit excedido", { ip: clientIP });
      return rateLimitResponse;
    }

    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Validação completa da senha usando passwordSchema
    const passwordValidation = passwordSchema.safeParse(newPassword);
    if (!passwordValidation.success) {
      const firstError = passwordValidation.error.issues[0];
      return NextResponse.json(
        { message: firstError.message },
        { status: 400 }
      );
    }

    // Verificar se o token existe e é válido
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Token inválido ou expirado." },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { message: "Token expirado. Solicite uma nova recuperação de senha." },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 10);

    // Atualizar senha do usuário
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { hashedPassword },
    });

    // Deletar o token usado
    await db.verificationToken.delete({ where: { token } });

    logger.info("reset-password:POST - Senha redefinida com sucesso", {
      email: verificationToken.identifier,
    });

    return NextResponse.json(
      { message: "Senha redefinida com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("reset-password:POST - Erro ao redefinir senha", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { message: "Ocorreu um erro ao redefinir a senha." },
      { status: 500 }
    );
  }
}
