import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [notifications, unreadCount, user] = await Promise.all([
      db.notification.findMany({
        where: {
          userId: session.user.id,
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
    console.error("Error fetching notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
