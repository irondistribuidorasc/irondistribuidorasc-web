"use client";

import { Card, CardBody, CardHeader, Divider, Button, Chip, Avatar } from "@heroui/react";
import Link from "next/link";
import {
	ChevronLeftIcon,
	PrinterIcon,
	ShoppingBagIcon,
	UserIcon,
	MapPinIcon,
	CubeIcon,
	CalendarDaysIcon,
	ClockIcon,
	BanknotesIcon,
	HashtagIcon,
	EnvelopeIcon,
	PhoneIcon,
	IdentificationIcon,
	BuildingStorefrontIcon,
	ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
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

// Helper para obter iniciais do nome
function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

// Helper para obter emoji do método de pagamento
function getPaymentEmoji(method: string): string {
	switch (method) {
		case "PIX":
			return "⚡";
		case "CREDIT_CARD":
			return "💳";
		case "DEBIT_CARD":
			return "💳";
		case "BOLETO":
			return "📄";
		case "CASH":
			return "💵";
		default:
			return "💰";
	}
}

// Helper para obter nome do método de pagamento
function getPaymentName(method: string): string {
	switch (method) {
		case "PIX":
			return "Pix";
		case "CREDIT_CARD":
			return "Cartão de Crédito";
		case "DEBIT_CARD":
			return "Cartão de Débito";
		case "BOLETO":
			return "Boleto";
		case "CASH":
			return "Dinheiro";
		default:
			return "Outro";
	}
}

export default function OrderDetailsClient({ order }: OrderDetailsClientProps) {
	const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
	const isAvulsoCustomer = order.customerEmail?.includes("@iron.local");

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Background Pattern */}
			<div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHptMTggMGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiIGZpbGw9IiM5NDk0YjgiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvZz48L3N2Zz4=')] opacity-60" />

			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				{/* Back Button */}
				<Button
					as={Link}
					href="/admin/pedidos"
					variant="light"
					className="mb-6 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
				>
					<ChevronLeftIcon className="mr-1 h-4 w-4" />
					Voltar para Pedidos
				</Button>

				{/* Header Card */}
				<Card className="mb-8 overflow-hidden border-0 shadow-xl">
					<div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
						{/* Decorative elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
						</div>

						<div className="relative px-6 py-6 sm:px-8 sm:py-8">
							<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
								{/* Left: Order Info */}
								<div className="flex items-start gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-red-600 shadow-lg shadow-brand-500/30">
										<ShoppingBagIcon className="h-7 w-7 text-white" />
									</div>
									<div>
										<div className="flex flex-wrap items-center gap-3">
											<h1 className="text-2xl font-bold text-white sm:text-3xl">
												Pedido #{order.orderNumber}
											</h1>
											<OrderStatusBadge status={order.status as OrderStatus} />
										</div>
										<div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
											<span className="flex items-center gap-1.5">
												<CalendarDaysIcon className="h-4 w-4" />
												{new Date(order.createdAt).toLocaleDateString("pt-BR", {
													day: "2-digit",
													month: "long",
													year: "numeric",
													timeZone: "America/Sao_Paulo",
												})}
											</span>
											<span className="flex items-center gap-1.5">
												<ClockIcon className="h-4 w-4" />
												{new Date(order.createdAt).toLocaleTimeString("pt-BR", {
													hour: "2-digit",
													minute: "2-digit",
													timeZone: "America/Sao_Paulo",
												})}
											</span>
										</div>
									</div>
								</div>

								{/* Right: Actions */}
								<div className="flex flex-wrap items-center gap-3">
									<Button
										startContent={<PrinterIcon className="h-5 w-5" />}
										variant="flat"
										className="bg-white/10 text-white hover:bg-white/20 transition-colors"
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
								</div>
							</div>

							{/* Stats Row */}
							<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
								<div className="rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
									<p className="text-xs font-medium text-slate-400">Total de Itens</p>
									<p className="mt-1 text-xl font-bold text-white">{totalItems}</p>
								</div>
								<div className="rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
									<p className="text-xs font-medium text-slate-400">Produtos</p>
									<p className="mt-1 text-xl font-bold text-white">{order.items.length}</p>
								</div>
								<div className="rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
									<p className="text-xs font-medium text-slate-400">Pagamento</p>
									<p className="mt-1 text-lg font-bold text-white flex items-center gap-1.5">
										<span>{getPaymentEmoji(order.paymentMethod)}</span>
										{getPaymentName(order.paymentMethod)}
									</p>
								</div>
								<div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 px-4 py-3 backdrop-blur-sm border border-emerald-500/20">
									<p className="text-xs font-medium text-emerald-300">Valor Total</p>
									<p className="mt-1 text-xl font-bold text-emerald-400">
										{formatCurrency(order.total)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Controls Row */}
				<div className="mb-6 flex flex-wrap items-center gap-4">
					<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
						<span className="text-sm font-medium text-slate-500 dark:text-slate-400">
							📋 Status:
						</span>
						<OrderStatusSelector
							orderId={order.id}
							currentStatus={order.status as OrderStatus}
						/>
					</div>
					<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
						<span className="text-sm font-medium text-slate-500 dark:text-slate-400">
							💳 Pagamento:
						</span>
						<PaymentMethodSelector
							orderId={order.id}
							currentMethod={order.paymentMethod || "OTHER"}
						/>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main Content - Left Column */}
					<div className="space-y-6 lg:col-span-2">
						{/* Order Items */}
						<Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
							<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:border-slate-700 dark:from-violet-900/20 dark:to-purple-900/20">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
										<CubeIcon className="h-5 w-5 text-white" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
											Itens do Pedido
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{order.items.length} produto{order.items.length !== 1 ? "s" : ""} • {totalItems} ite{totalItems !== 1 ? "ns" : "m"}
										</p>
									</div>
								</div>
							</CardHeader>
							<CardBody className="p-0">
								<div className="divide-y divide-slate-100 dark:divide-slate-700">
									{order.items.map((item, index) => (
										<div
											key={item.id}
											className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
										>
											{/* Item Number */}
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
												{index + 1}
											</div>

											{/* Product Info */}
											<div className="min-w-0 flex-1">
												<p className="font-medium text-slate-900 dark:text-slate-100 truncate">
													{item.productName}
												</p>
												<p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
													<HashtagIcon className="h-3 w-3" />
													{item.productCode}
												</p>
											</div>

											{/* Quantity Badge */}
											<Chip
												size="sm"
												variant="flat"
												className="bg-slate-100 dark:bg-slate-700"
											>
												{item.quantity}x
											</Chip>

											{/* Price */}
											<div className="text-right">
												<p className="text-xs text-slate-500 dark:text-slate-400">
													{formatCurrency(item.price)} un.
												</p>
												<p className="font-semibold text-slate-900 dark:text-slate-100">
													{formatCurrency(item.total)}
												</p>
											</div>
										</div>
									))}
								</div>

								{/* Total Footer */}
								<div className="border-t border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 dark:border-slate-700 dark:from-emerald-900/20 dark:to-teal-900/20">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<BanknotesIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
											<span className="font-semibold text-slate-700 dark:text-slate-300">
												Total do Pedido
											</span>
										</div>
										<span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
											{formatCurrency(order.total)}
										</span>
									</div>
								</div>
							</CardBody>
						</Card>

						{/* Notes */}
						{order.notes && (
							<Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
								<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 dark:border-slate-700 dark:from-amber-900/20 dark:to-orange-900/20">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
											<ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-white" />
										</div>
										<div>
											<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
												Observações
											</h2>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												Notas do cliente
											</p>
										</div>
									</div>
								</CardHeader>
								<CardBody className="px-6 py-4">
									<p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
										{order.notes}
									</p>
								</CardBody>
							</Card>
						)}
					</div>

					{/* Sidebar - Right Column */}
					<div className="space-y-6">
						{/* Customer Info */}
						<Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
							<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 dark:border-slate-700 dark:from-blue-900/20 dark:to-cyan-900/20">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
										<UserIcon className="h-5 w-5 text-white" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
											Cliente
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Dados do comprador
										</p>
									</div>
								</div>
							</CardHeader>
							<CardBody className="space-y-4 px-6 py-5">
								{/* Customer Avatar & Name */}
								<div className="flex items-center gap-3">
									<Avatar
										name={getInitials(order.customerName)}
										classNames={{
											base: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30",
										}}
									/>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
											{order.customerName}
										</p>
										{isAvulsoCustomer && (
											<Chip
												size="sm"
												variant="flat"
												color="warning"
												className="mt-1"
											>
												Cliente Avulso
											</Chip>
										)}
									</div>
								</div>

								<Divider className="my-3" />

								{/* Contact Info */}
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<EnvelopeIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium text-slate-400">Email</p>
											<p className="text-sm text-slate-700 dark:text-slate-300 truncate">
												{order.customerEmail}
											</p>
										</div>
									</div>

									{order.customerPhone && (
										<div className="flex items-start gap-3">
											<PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
											<div className="min-w-0 flex-1">
												<p className="text-xs font-medium text-slate-400">Telefone</p>
												<p className="text-sm text-slate-700 dark:text-slate-300">
													{order.customerPhone}
												</p>
											</div>
										</div>
									)}

									{order.customerDocNumber && (
										<div className="flex items-start gap-3">
											<IdentificationIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
											<div className="min-w-0 flex-1">
												<p className="text-xs font-medium text-slate-400">Documento</p>
												<p className="text-sm text-slate-700 dark:text-slate-300">
													{order.customerDocNumber}
												</p>
											</div>
										</div>
									)}
								</div>

								<Divider className="my-3" />

								<Button
									as={Link}
									href={`/admin/usuarios?search=${encodeURIComponent(order.customerEmail)}`}
									variant="flat"
									className="w-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 hover:from-blue-500/20 hover:to-cyan-500/20 dark:text-blue-400 transition-all"
								>
									<UserIcon className="h-4 w-4 mr-1.5" />
									Ver Perfil Completo
								</Button>
							</CardBody>
						</Card>

						{/* Shipping Info */}
						<Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
							<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 dark:border-slate-700 dark:from-emerald-900/20 dark:to-teal-900/20">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
										<MapPinIcon className="h-5 w-5 text-white" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
											Endereço
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Local de entrega
										</p>
									</div>
								</div>
							</CardHeader>
							<CardBody className="px-6 py-5">
								{order.addressLine1 ? (
									<div className="space-y-2">
										<div className="flex items-start gap-3">
											<BuildingStorefrontIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
											<div className="space-y-1">
												<p className="text-sm font-medium text-slate-700 dark:text-slate-300">
													{order.addressLine1}
												</p>
												{order.addressLine2 && (
													<p className="text-sm text-slate-500 dark:text-slate-400">
														{order.addressLine2}
													</p>
												)}
											</div>
										</div>

										<Divider className="my-3" />

										<div className="grid grid-cols-2 gap-3 text-sm">
											<div>
												<p className="text-xs font-medium text-slate-400">Cidade</p>
												<p className="text-slate-700 dark:text-slate-300">{order.city || "—"}</p>
											</div>
											<div>
												<p className="text-xs font-medium text-slate-400">Estado</p>
												<p className="text-slate-700 dark:text-slate-300">{order.state || "—"}</p>
											</div>
											<div className="col-span-2">
												<p className="text-xs font-medium text-slate-400">CEP</p>
												<p className="text-slate-700 dark:text-slate-300">{order.postalCode || "—"}</p>
											</div>
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-4 text-center">
										<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
											<MapPinIcon className="h-6 w-6 text-slate-400" />
										</div>
										<p className="text-sm text-slate-500 dark:text-slate-400">
											Endereço não informado
										</p>
									</div>
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
