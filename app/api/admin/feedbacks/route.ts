import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

/**
 * GET /api/admin/feedbacks
 * Lista todos os feedbacks (ADMIN apenas) com filtros, paginação e estatísticas
 */
export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		// Verificar autenticação e permissão de admin
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		if (session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
		}

		// Extrair parâmetros de query
		const searchParams = req.nextUrl.searchParams;
		const rating = searchParams.get("rating");
		const hasComment = searchParams.get("hasComment");
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = Math.min(
			parseInt(searchParams.get("limit") || "20", 10),
			100,
		);

		// Construir filtros
		const where: Prisma.OrderFeedbackWhereInput = {};

		// Filtro por rating
		if (rating && rating !== "all") {
			where.rating = parseInt(rating, 10);
		}

		// Filtro por comentário
		if (hasComment === "true") {
			where.comment = { not: null };
		} else if (hasComment === "false") {
			where.comment = null;
		}

		// Buscar feedbacks com paginação e estatísticas em paralelo
		const [total, feedbacks, statsAggregate, ratingGroups] = await Promise.all([
			// Total de registros com filtro
			db.orderFeedback.count({ where }),
			// Feedbacks paginados
			db.orderFeedback.findMany({
				where,
				include: {
					order: {
						select: {
							id: true,
							orderNumber: true,
							customerName: true,
							total: true,
							createdAt: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			// Estatísticas agregadas (média e total)
			db.orderFeedback.aggregate({
				_avg: { rating: true },
				_count: true,
			}),
			// Distribuição por rating
			db.orderFeedback.groupBy({
				by: ["rating"],
				_count: true,
			}),
		]);

		// Processar estatísticas
		const totalFeedbacks = statsAggregate._count;
		const averageRating = statsAggregate._avg.rating || 0;

		// Criar mapa de contagem por rating
		const ratingCountMap = new Map(
			ratingGroups.map((g) => [g.rating, g._count]),
		);

		// Calcular distribuição por rating
		const distribution = [1, 2, 3, 4, 5].map((r) => {
			const count = ratingCountMap.get(r) || 0;
			return {
				rating: r,
				count,
				percentage: totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0,
			};
		});

		// Calcular metadados de paginação
		const totalPages = Math.ceil(total / limit);
		const hasNext = page < totalPages;
		const hasPrev = page > 1;

		return NextResponse.json({
			feedbacks,
			stats: {
				totalFeedbacks,
				averageRating: Math.round(averageRating * 10) / 10,
				distribution,
			},
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNext,
				hasPrev,
			},
		});
	} catch (error) {
		console.error("Error fetching feedbacks:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar avaliações" },
			{ status: 500 },
		);
	}
}
