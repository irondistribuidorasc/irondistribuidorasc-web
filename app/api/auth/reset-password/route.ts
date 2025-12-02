import { db } from "@/src/lib/prisma";
import { MIN_PASSWORD_LENGTH } from "@/src/lib/validation";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          message: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
        },
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

    return NextResponse.json(
      { message: "Senha redefinida com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao redefinir a senha." },
      { status: 500 }
    );
  }
}
