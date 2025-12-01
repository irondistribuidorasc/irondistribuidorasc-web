import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
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
    console.error("Error fetching admin notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
