"use client";

import { Card, CardBody, CardHeader, Divider, Button } from "@heroui/react";
import Link from "next/link";
import { ChevronLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { OrderStatusBadge } from "@/src/components/admin/OrderStatusBadge";
import { OrderStatusSelector } from "@/src/components/admin/OrderStatusSelector";
import { PaymentMethodSelector } from "@/src/components/admin/PaymentMethodSelector";
import { formatCurrency } from "@/src/lib/utils";
import type { OrderStatus } from "@/types/order";

interface OrderItem {
	id: string;
	productName: string;
	productCode: string;
	quantity: number;
	price: number;
	total: number;
}

interface Order {
	id: string;
	orderNumber: string;
	status: string;
	createdAt: Date;
	total: number;
	notes: string | null;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	customerDocNumber: string | null;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	postalCode: string;
	paymentMethod: string;
	items: OrderItem[];
}

interface OrderDetailsClientProps {
	order: Order;
}

export default function OrderDetailsClient({ order }: OrderDetailsClientProps) {
	return (
		<div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900">
			<div className="mx-auto w-full max-w-5xl">
				{/* Header */}
				<div className="mb-8">
					<Button
						as={Link}
						href="/admin/pedidos"
						variant="light"
						className="mb-4 -ml-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
					>
						<ChevronLeftIcon className="mr-1 h-4 w-4" />
						Voltar para Pedidos
					</Button>

					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
									Pedido #{order.orderNumber}
								</h1>
								<OrderStatusBadge status={order.status as OrderStatus} />
							</div>
							<p className="mt-2 text-slate-600 dark:text-slate-400">
								Realizado em{" "}
								{new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
								{new Date(order.createdAt).toLocaleTimeString("pt-BR")}
							</p>
						</div>

						<div className="flex gap-3">
							<Button
								startContent={<PrinterIcon className="h-5 w-5" />}
								variant="flat"
								className="hidden sm:flex"
								onPress={() => {
									window.open(
										`/admin/pedidos/${order.id}/print`,
										"print_popup",
										"width=400,height=600,scrollbars=yes,resizable=yes",
									);
								}}
							>
								Imprimir
							</Button>
							<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
								<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
									Status:
								</span>
								<OrderStatusSelector
									orderId={order.id}
									currentStatus={order.status as OrderStatus}
								/>
							</div>
							<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
								<PaymentMethodSelector
									orderId={order.id}
									currentMethod={order.paymentMethod || "OTHER"}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main Content - Left Column */}
					<div className="space-y-6 lg:col-span-2">
						{/* Order Items */}
						<Card className="border border-slate-200 dark:border-slate-800">
							<CardHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
								<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
									Itens do Pedido
								</h2>
							</CardHeader>
							<CardBody className="p-0">
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
											<tr>
												<th className="px-6 py-3 font-medium">Produto</th>
												<th className="px-6 py-3 font-medium text-center">
													Qtd
												</th>
												<th className="px-6 py-3 font-medium text-right">
													Preço Unit.
												</th>
												<th className="px-6 py-3 font-medium text-right">
													Total
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
											{order.items.map((item) => (
												<tr
													key={item.id}
													className="bg-white dark:bg-slate-900"
												>
													<td className="px-6 py-4">
														<div className="font-medium text-slate-900 dark:text-slate-100">
															{item.productName}
														</div>
														<div className="text-xs text-slate-500 dark:text-slate-400">
															Cód: {item.productCode}
														</div>
													</td>
													<td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
														{item.quantity}
													</td>
													<td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
														{formatCurrency(item.price)}
													</td>
													<td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
														{formatCurrency(item.total)}
													</td>
												</tr>
											))}
										</tbody>
										<tfoot className="bg-slate-50 dark:bg-slate-800">
											<tr>
												<td
													colSpan={3}
													className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100"
												>
													Total
												</td>
												<td className="px-6 py-4 text-right font-bold text-brand-600 dark:text-brand-400">
													{formatCurrency(order.total)}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</CardBody>
						</Card>

						{/* Notes */}
						{order.notes && (
							<Card className="border border-slate-200 dark:border-slate-800">
								<CardHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
									<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
										Observações
									</h2>
								</CardHeader>
								<CardBody className="px-6 py-4">
									<p className="text-slate-600 dark:text-slate-400">
										{order.notes}
									</p>
								</CardBody>
							</Card>
						)}
					</div>

					{/* Sidebar - Right Column */}
					<div className="space-y-6">
						{/* Customer Info */}
						<Card className="border border-slate-200 dark:border-slate-800">
							<CardHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
								<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
									Dados do Cliente
								</h2>
							</CardHeader>
							<CardBody className="space-y-4 px-6 py-4">
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
										Nome
									</p>
									<p className="text-slate-900 dark:text-slate-100">
										{order.customerName}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
										Email
									</p>
									<p className="text-slate-900 dark:text-slate-100">
										{order.customerEmail}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
										Telefone
									</p>
									<p className="text-slate-900 dark:text-slate-100">
										{order.customerPhone}
									</p>
								</div>
								{order.customerDocNumber && (
									<div>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
											Documento
										</p>
										<p className="text-slate-900 dark:text-slate-100">
											{order.customerDocNumber}
										</p>
									</div>
								)}
								<Divider className="my-2" />
								<Button
									as={Link}
									href={`/admin?search=${order.customerEmail}`}
									size="sm"
									variant="flat"
									color="primary"
									className="w-full"
								>
									Ver Perfil do Cliente
								</Button>
							</CardBody>
						</Card>

						{/* Shipping Info */}
						<Card className="border border-slate-200 dark:border-slate-800">
							<CardHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
								<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
									Endereço de Entrega
								</h2>
							</CardHeader>
							<CardBody className="space-y-2 px-6 py-4 text-slate-600 dark:text-slate-400">
								<p>{order.addressLine1}</p>
								{order.addressLine2 && <p>{order.addressLine2}</p>}
								<p>
									{order.city} - {order.state}
								</p>
								<p>{order.postalCode}</p>
							</CardBody>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
