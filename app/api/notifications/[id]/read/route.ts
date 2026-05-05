import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const updatedNotification = await db.notification.update({
      where: { id },
      data: { read: true },
      select: {
        id: true,
        title: true,
        message: true,
        read: true,
        link: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    logger.error("notifications/[id]/read:PATCH - Erro ao marcar notificação como lida", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Erro ao atualizar notificação" }, { status: 500 });
  }
}
