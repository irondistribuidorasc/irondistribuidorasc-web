"use client";

import { Order } from "@/types/order";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Spinner,
	Card,
	CardBody,
} from "@heroui/react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusSelector } from "./OrderStatusSelector";
import { formatCurrency } from "@/src/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface AdminOrdersTableProps {
	orders: Order[];
	isLoading?: boolean;
	onStatusChange?: () => void;
}

export function AdminOrdersTable({
	orders,
	isLoading = false,
	onStatusChange,
}: AdminOrdersTableProps) {
	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="lg" color="danger" />
			</div>
		);
	}

	if (orders.length === 0) {
		return (
			<Card>
				<CardBody className="py-12 text-center">
					<p className="text-slate-600 dark:text-slate-400">
						Nenhum pedido encontrado
					</p>
				</CardBody>
			</Card>
		);
	}

	return (
		<div className="overflow-x-auto">
			{/* Desktop Table View */}
			<div className="hidden md:block">
				<Table
					aria-label="Admin orders table"
					className="dark:rounded-lg dark:border dark:border-slate-800"
				>
					<TableHeader>
						<TableColumn>PEDIDO</TableColumn>
						<TableColumn>CLIENTE</TableColumn>
						<TableColumn>CONTATO</TableColumn>
						<TableColumn>TOTAL</TableColumn>
						<TableColumn>STATUS</TableColumn>
						<TableColumn>DATA</TableColumn>
						<TableColumn>AÇÕES</TableColumn>
					</TableHeader>
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell>
									<Link
										href={`/admin/pedidos/${order.id}`}
										className="font-mono text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
									>
										#{order.orderNumber}
									</Link>
								</TableCell>
								<TableCell>
									<div className="flex flex-col">
										<span className="font-medium text-slate-900 dark:text-slate-100">
											{order.customerName}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
										<span>{order.customerEmail}</span>
										<span>{order.customerPhone}</span>
									</div>
								</TableCell>
								<TableCell>
									<span className="font-semibold text-slate-900 dark:text-slate-100">
										{formatCurrency(order.total)}
									</span>
								</TableCell>
								<TableCell>
									<OrderStatusBadge status={order.status} />
								</TableCell>
								<TableCell>
									<span className="text-sm text-slate-600 dark:text-slate-400">
										{format(new Date(order.createdAt), "dd/MM/yyyy", {
											locale: ptBR,
										})}
									</span>
								</TableCell>
								<TableCell>
									<OrderStatusSelector
										orderId={order.id}
										currentStatus={order.status}
										onStatusChange={onStatusChange}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Card View */}
			<div className="flex flex-col gap-4 md:hidden">
				{orders.map((order) => (
					<Card
						key={order.id}
						className="border border-slate-200 dark:border-slate-800"
					>
						<CardBody className="gap-3">
							<div className="flex items-start justify-between">
								<Link
									href={`/admin/pedidos/${order.id}`}
									className="font-mono text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
								>
									#{order.orderNumber}
								</Link>
								<OrderStatusBadge status={order.status} />
							</div>

							<div>
								<p className="font-medium text-slate-900 dark:text-slate-100">
									{order.customerName}
								</p>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									{order.customerEmail}
								</p>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									{order.customerPhone}
								</p>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
									{formatCurrency(order.total)}
								</span>
								<span className="text-sm text-slate-600 dark:text-slate-400">
									{format(new Date(order.createdAt), "dd/MM/yyyy", {
										locale: ptBR,
									})}
								</span>
							</div>

							<OrderStatusSelector
								orderId={order.id}
								currentStatus={order.status}
								onStatusChange={onStatusChange}
							/>
						</CardBody>
					</Card>
				))}
			</div>
		</div>
	);
}
