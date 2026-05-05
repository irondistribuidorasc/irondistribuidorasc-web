import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const [notifications, unreadCount, user] = await Promise.all([
      db.notification.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          message: true,
          read: true,
          link: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20, // Limit to last 20 notifications
      }),
      db.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { approved: true },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      userApproved: user?.approved ?? false,
    });
  } catch (error) {
    logger.error("notifications:GET - Erro ao buscar notificações", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}
