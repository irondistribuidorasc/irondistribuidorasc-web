"use client";

import { OrderStatus } from "@/types/order";
import { Chip } from "@heroui/react";

interface OrderStatusBadgeProps {
	status: OrderStatus;
	size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
	OrderStatus,
	{
		label: string;
		color: "default" | "primary" | "success" | "warning" | "danger";
	}
> = {
	PENDING: { label: "Pendente", color: "warning" },
	CONFIRMED: { label: "Confirmado", color: "primary" },
	PROCESSING: { label: "Processando", color: "primary" },
	SHIPPED: { label: "Enviado", color: "success" },
	DELIVERED: { label: "Entregue", color: "success" },
	CANCELLED: { label: "Cancelado", color: "danger" },
};

export function OrderStatusBadge({
	status,
	size = "sm",
}: OrderStatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<Chip color={config.color} variant="flat" size={size}>
			{config.label}
		</Chip>
	);
}
