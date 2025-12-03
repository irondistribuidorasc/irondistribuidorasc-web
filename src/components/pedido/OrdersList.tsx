"use client";

import type { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrderCard } from "./OrderCard";
import { OrderDetailsModal } from "./OrderDetailsModal";

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();

  const handleCancelOrder = async (order: Order) => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao cancelar pedido");
      }

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      toast.success("Pedido cancelado com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Erro ao cancelar pedido. Tente novamente.");
    }
  };

  return (
    <>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={() => setSelectedOrder(order)}
            onCancel={handleCancelOrder}
          />
        ))}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
