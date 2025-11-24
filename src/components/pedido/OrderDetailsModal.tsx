"use client";

import { Order, OrderStatus } from "@/types/order";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Chip,
	Divider,
} from "@heroui/react";
import { formatCurrency } from "@/src/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	MapPinIcon,
	PhoneIcon,
	EnvelopeIcon,
	IdentificationIcon,
	ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface OrderDetailsModalProps {
	order: Order | null;
	isOpen: boolean;
	onClose: () => void;
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

export function OrderDetailsModal({
	order,
	isOpen,
	onClose,
}: OrderDetailsModalProps) {
	if (!order) return null;

	const status = statusConfig[order.status];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="3xl"
			scrollBehavior="inside"
			classNames={{
				base: "bg-white dark:bg-slate-900",
				header: "border-b border-slate-200 dark:border-slate-800",
				footer: "border-t border-slate-200 dark:border-slate-800",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
							Pedido #{order.orderNumber}
						</h2>
						<Chip color={status.color} variant="flat" size="sm">
							{status.label}
						</Chip>
					</div>
					<p className="text-sm font-normal text-slate-600 dark:text-slate-400">
						Realizado em{" "}
						{format(
							new Date(order.createdAt),
							"dd 'de' MMMM 'de' yyyy 'às' HH:mm",
							{
								locale: ptBR,
							},
						)}
					</p>
				</ModalHeader>

				<ModalBody className="gap-6 py-6">
					{/* Items do pedido */}
					<section>
						<h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							<ClipboardDocumentListIcon className="h-5 w-5" />
							Itens do Pedido
						</h3>
						<div className="space-y-3">
							{order.items.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
								>
									<div className="flex-1">
										<p className="font-medium text-slate-900 dark:text-slate-100">
											{item.productName}
										</p>
										<p className="text-sm text-slate-600 dark:text-slate-400">
											Código: {item.productCode}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium text-slate-900 dark:text-slate-100">
											{item.quantity}x {formatCurrency(item.price)}
										</p>
										<p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
											{formatCurrency(item.total)}
										</p>
									</div>
								</div>
							))}
						</div>

						<Divider className="my-4" />

						<div className="flex items-center justify-between">
							<span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								Total
							</span>
							<span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
								{formatCurrency(order.total)}
							</span>
						</div>
					</section>

					<Divider />

					{/* Informações do cliente */}
					<section>
						<h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
							Informações do Cliente
						</h3>
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<IdentificationIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
								<div>
									<p className="font-medium text-slate-900 dark:text-slate-100">
										{order.customerName}
									</p>
									{order.customerDocNumber && (
										<p className="text-sm text-slate-600 dark:text-slate-400">
											CPF/CNPJ: {order.customerDocNumber}
										</p>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2">
								<EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
								<p className="text-slate-700 dark:text-slate-300">
									{order.customerEmail}
								</p>
							</div>

							<div className="flex items-center gap-2">
								<PhoneIcon className="h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
								<p className="text-slate-700 dark:text-slate-300">
									{order.customerPhone}
								</p>
							</div>
						</div>
					</section>

					<Divider />

					{/* Endereço de entrega */}
					<section>
						<h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							<MapPinIcon className="h-5 w-5" />
							Endereço de Entrega
						</h3>
						<div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
							<p className="text-slate-900 dark:text-slate-100">
								{order.addressLine1}
							</p>
							{order.addressLine2 && (
								<p className="text-slate-900 dark:text-slate-100">
									{order.addressLine2}
								</p>
							)}
							<p className="text-slate-900 dark:text-slate-100">
								{order.city}, {order.state} - CEP {order.postalCode}
							</p>
						</div>
					</section>

					{/* Observações */}
					{order.notes && (
						<>
							<Divider />
							<section>
								<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
									Observações
								</h3>
								<p className="text-slate-700 dark:text-slate-300">
									{order.notes}
								</p>
							</section>
						</>
					)}
				</ModalBody>

				<ModalFooter>
					<Button color="danger" variant="light" onPress={onClose}>
						Fechar
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
