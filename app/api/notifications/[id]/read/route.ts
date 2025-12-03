import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedNotification = await db.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
