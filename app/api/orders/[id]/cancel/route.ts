import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Verify ownership
    if (order.customerEmail !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify status
    if (order.status !== "PENDING") {
      return new NextResponse("Order cannot be cancelled", { status: 400 });
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_CANCEL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
