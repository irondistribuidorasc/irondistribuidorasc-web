import { compare } from "bcrypt";
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { getClientIP, withRateLimit } from "@/src/lib/rate-limit";

/**
 * DELETE /api/account/delete
 * Exclui permanentemente a conta do usuário e todos os dados associados (LGPD Art. 18)
 *
 * Requer confirmação de senha para segurança adicional
 */
export async function DELETE(request: Request) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		// Rate limiting para ações sensíveis
		const clientIP = getClientIP(request);
		const rateLimitResponse = await withRateLimit(clientIP, "sensitiveAction");
		if (rateLimitResponse) {
			logger.warn("account/delete - Rate limit excedido", {
				userId: session.user.id,
				ip: clientIP,
			});
			return rateLimitResponse;
		}

		const body = await request.json().catch(() => ({}));
		const { password, confirmation } = body as {
			password?: string;
			confirmation?: string;
		};

		// Validar confirmação textual
		if (confirmation !== "EXCLUIR MINHA CONTA") {
			return NextResponse.json(
				{
					error:
						"Confirmação inválida. Digite 'EXCLUIR MINHA CONTA' para confirmar.",
				},
				{ status: 400 },
			);
		}

		// Buscar usuário para verificar senha
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				email: true,
				hashedPassword: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 },
			);
		}

		// Verificar senha se o usuário tem uma (cadastro por email)
		if (user.hashedPassword) {
			if (!password) {
				return NextResponse.json(
					{ error: "Senha é obrigatória para confirmar a exclusão" },
					{ status: 400 },
				);
			}

			const isPasswordValid = await compare(password, user.hashedPassword);
			if (!isPasswordValid) {
				logger.warn(
					"account/delete - Senha inválida na tentativa de exclusão",
					{
						userId: user.id,
					},
				);
				return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
			}
		}

		// Mascarar email para logs (privacidade)
		const maskedEmail = user.email
			? `${user.email.substring(0, 3)}***@${user.email.split("@")[1]}`
			: "unknown";

		// Log antes da exclusão para auditoria
		logger.info("account/delete - Iniciando exclusão de conta", {
			userId: user.id,
			emailDomain: user.email?.split("@")[1] || "unknown",
		});

		// Excluir usuário (cascata configurada no Prisma para deletar dados relacionados)
		// A ordem do cascade: Orders -> OrderItems, Notifications, Sessions, Accounts, User
		await db.user.delete({
			where: { id: user.id },
		});

		logger.info("account/delete - Conta excluída com sucesso", {
			userId: user.id,
			maskedEmail,
		});

		return NextResponse.json(
			{
				message: "Sua conta e todos os dados foram excluídos permanentemente.",
				deletedAt: new Date().toISOString(),
			},
			{ status: 200 },
		);
	} catch (error) {
		logger.error("account/delete - Erro ao excluir conta", {
			error: error instanceof Error ? error.message : String(error),
		});
		return NextResponse.json(
			{ error: "Erro ao excluir conta. Tente novamente mais tarde." },
			{ status: 500 },
		);
	}
}
