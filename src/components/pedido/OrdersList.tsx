"use client";

import { Order } from "@/types/order";
import { OrderCard } from "./OrderCard";
import { useState } from "react";
import { OrderDetailsModal } from "./OrderDetailsModal";

interface OrdersListProps {
	orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	return (
		<>
			<div className="grid gap-4 md:gap-6">
				{orders.map((order) => (
					<OrderCard
						key={order.id}
						order={order}
						onViewDetails={() => setSelectedOrder(order)}
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
