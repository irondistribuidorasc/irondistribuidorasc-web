import { db } from "@/src/lib/prisma";
import { normalizeEmail } from "@/src/lib/validation";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    console.log(`[ForgotPassword] Solicitado para: ${normalizedEmail}`);

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log(
        `[ForgotPassword] Usuário NÃO encontrado: ${normalizedEmail}`
      );
      // Retornamos sucesso mesmo se o usuário não existir para evitar enumeração de e-mails
      return NextResponse.json(
        {
          message: "Se o e-mail existir, um link de recuperação será enviado.",
        },
        { status: 200 }
      );
    }

    console.log(`[ForgotPassword] Usuário encontrado. Gerando token...`);

    // Gerar token seguro
    const token = randomBytes(32).toString("hex");
    const expires = addHours(new Date(), 1); // Expira em 1 hora

    // Salvar token no banco
    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    });

    const resetLink = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/redefinir-senha?token=${token}`;

    // Verificar se a chave da API do Resend está configurada
    if (!process.env.RESEND_API_KEY) {
      console.error("[ForgotPassword] RESEND_API_KEY não configurada.");
      // Em desenvolvimento, podemos logar o link se não houver chave
      if (process.env.NODE_ENV === "development") {
        console.log(
          "================================================================="
        );
        console.log("🔗 LINK DE RECUPERAÇÃO DE SENHA (MOCK - SEM RESEND):");
        console.log(resetLink);
        console.log(
          "================================================================="
        );
        return NextResponse.json(
          {
            message:
              "Se o e-mail existir, um link de recuperação será enviado (Mock).",
          },
          { status: 200 }
        );
      }
      throw new Error("Serviço de e-mail não configurado.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Enviar e-mail via Resend
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    console.log(`[ForgotPassword] Enviando via Resend de: ${fromEmail}`);

    const { data, error } = await resend.emails.send({
      from: `Iron Distribuidora <${fromEmail}>`,
      to: normalizedEmail,
      subject: "Recuperação de Senha - Iron Distribuidora",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Senha</a>
          <p style="margin-top: 24px; font-size: 14px; color: #666;">Se você não solicitou esta alteração, ignore este e-mail.</p>
          <p style="font-size: 12px; color: #999;">O link expira em 1 hora.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[ForgotPassword] Erro retornado pelo Resend:", error);
      return NextResponse.json(
        { message: "Erro ao enviar e-mail." },
        { status: 500 }
      );
    }

    console.log(`[ForgotPassword] E-mail enviado com sucesso. ID: ${data?.id}`);

    console.log(
      `[ForgotPassword] E-mail enviado com sucesso para: ${normalizedEmail}`
    );

    return NextResponse.json(
      { message: "Se o e-mail existir, um link de recuperação será enviado." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao processar sua solicitação." },
      { status: 500 }
    );
  }
}
