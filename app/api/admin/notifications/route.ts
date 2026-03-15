import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const [pendingOrdersCount, lowStockResult, latestOrder] = await Promise.all(
      [
        db.order.count({
          where: {
            status: "PENDING",
          },
        }),
        // Raw query required because Prisma doesn't support comparing two columns in 'where' clause directly.
        // Assumes table name is "Product" (case-sensitive in Postgres if quoted).
        db.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int as count FROM "Product" WHERE "stockQuantity" <= "minStockThreshold"
      `,
        db.order.findFirst({
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        }),
      ]
    );

    // Handle the raw query result safely
    const lowStockCount = lowStockResult[0]?.count ?? 0;

    return NextResponse.json({
      pendingOrders: pendingOrdersCount,
      lowStockProducts: lowStockCount,
      latestOrderId: latestOrder?.id || null,
    });
  } catch (error) {
    logger.error("admin/notifications:GET - Erro ao buscar notificações admin", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}
