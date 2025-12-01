import { OrderConfirmationContent } from "@/src/components/order/OrderConfirmationContent";
import { db } from "@/src/lib/prisma";
import { notFound } from "next/navigation";

interface OrderConfirmationPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      orderNumber: true,
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderConfirmationContent orderNumber={order.orderNumber} />;
}
