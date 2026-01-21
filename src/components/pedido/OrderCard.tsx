"use client";

import {
	CalendarIcon,
	ChatBubbleLeftIcon,
	ChevronRightIcon,
	CubeIcon,
	StarIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { StarRating } from "@/src/components/feedback";
import { formatCurrency } from "@/src/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

interface OrderCardProps {
	order: Order;
	onViewDetails: () => void;
	onCancel: (order: Order) => void;
	onRate?: (order: Order) => void;
}

const statusConfig: Record<
	OrderStatus,
	{
		label: string;
		color: "default" | "primary" | "success" | "warning" | "danger";
		bgClass: string;
		textClass: string;
	}
> = {
	PENDING: {
		label: "Pendente",
		color: "warning",
		bgClass: "bg-amber-50 dark:bg-amber-900/20",
		textClass: "text-amber-700 dark:text-amber-400",
	},
	CONFIRMED: {
		label: "Confirmado",
		color: "primary",
		bgClass: "bg-blue-50 dark:bg-blue-900/20",
		textClass: "text-blue-700 dark:text-blue-400",
	},
	PROCESSING: {
		label: "Processando",
		color: "primary",
		bgClass: "bg-blue-50 dark:bg-blue-900/20",
		textClass: "text-blue-700 dark:text-blue-400",
	},
	SHIPPED: {
		label: "Enviado",
		color: "success",
		bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
		textClass: "text-emerald-700 dark:text-emerald-400",
	},
	DELIVERED: {
		label: "Entregue",
		color: "success",
		bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
		textClass: "text-emerald-700 dark:text-emerald-400",
	},
	CANCELLED: {
		label: "Cancelado",
		color: "danger",
		bgClass: "bg-red-50 dark:bg-red-900/20",
		textClass: "text-red-700 dark:text-red-400",
	},
};

export function OrderCard({
	order,
	onViewDetails,
	onCancel,
	onRate,
}: OrderCardProps) {
	const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
	const status = statusConfig[order.status];
	const isPending = order.status === "PENDING";
	const isCancelled = order.status === "CANCELLED";
	const isDelivered = order.status === "DELIVERED";
	const hasFeedback = !!order.feedback;

	return (
		<Card className="overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
			<CardBody className="p-0">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:px-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
							<CubeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
						</div>
						<div>
							<h3 className="font-semibold text-slate-900 dark:text-slate-100">
								Pedido #{order.orderNumber}
							</h3>
							<div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
								<CalendarIcon className="h-3.5 w-3.5" />
								<span>
									{new Date(order.createdAt).toLocaleDateString("pt-BR", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										timeZone: "America/Sao_Paulo",
									})}
								</span>
							</div>
						</div>
					</div>
					<Chip
						color={status.color}
						variant="flat"
						size="sm"
						className="font-medium"
					>
						{status.label}
					</Chip>
				</div>

				{/* Content */}
				<div className="px-4 py-4 sm:px-5">
					{/* Items & Total */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
							<span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium dark:bg-slate-700">
								{totalItems} {totalItems === 1 ? "item" : "itens"}
							</span>
						</div>
						<p className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{formatCurrency(order.total)}
						</p>
					</div>

					{/* WhatsApp Contact Info */}
					{!isPending && !isCancelled && (
						<div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs dark:bg-amber-900/20">
							<ChatBubbleLeftIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
							<p className="text-amber-800 dark:text-amber-300">
								Para cancelar ou alterar este pedido, entre em contato pelo
								WhatsApp:{" "}
								<a
									href="https://wa.me/5548991147117"
									target="_blank"
									rel="noopener noreferrer"
									className="font-semibold underline"
								>
									(48) 99114-7117
								</a>
							</p>
						</div>
					)}

					{/* Feedback section for delivered orders */}
					{isDelivered && hasFeedback && order.feedback && (
						<div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-900/20">
							<CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							<StarRating value={order.feedback.rating} readOnly size="sm" />
							<span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
								Avaliado
							</span>
						</div>
					)}
				</div>

				<Divider className="my-0" />

				{/* Footer Actions */}
				<div className="flex items-center gap-2 px-4 py-3 sm:px-5">
					<Button
						variant="flat"
						onPress={onViewDetails}
						className="flex-1 bg-slate-100 font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
						endContent={<ChevronRightIcon className="h-4 w-4" />}
					>
						Ver detalhes
					</Button>
					{isPending && (
						<Button
							color="danger"
							variant="flat"
							onPress={() => onCancel(order)}
							className="flex-1"
							startContent={<XCircleIcon className="h-4 w-4" />}
						>
							Cancelar
						</Button>
					)}
					{isDelivered && !hasFeedback && onRate && (
						<Button
							color="warning"
							variant="flat"
							onPress={() => onRate(order)}
							className="flex-1"
							startContent={<StarIcon className="h-4 w-4" />}
						>
							Avaliar
						</Button>
					)}
				</div>
			</CardBody>
		</Card>
	);
}
