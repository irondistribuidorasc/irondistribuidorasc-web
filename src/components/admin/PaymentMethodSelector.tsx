"use client";

import { Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentMethodSelectorProps {
	orderId: string;
	currentMethod: string;
}

const PAYMENT_METHODS = [
	{ key: "PIX", label: "Pix" },
	{ key: "CREDIT_CARD", label: "Cartão de Crédito" },
	{ key: "DEBIT_CARD", label: "Cartão de Débito" },
	{ key: "CASH", label: "Dinheiro" },
	{ key: "OTHER", label: "Outro" },
];

export function PaymentMethodSelector({
	orderId,
	currentMethod,
}: PaymentMethodSelectorProps) {
	const [method, setMethod] = useState(currentMethod);
	const [loading, setLoading] = useState(false);

	const handleSelectionChange = async (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newMethod = e.target.value;
		if (!newMethod) return;

		setMethod(newMethod);
		setLoading(true);

		try {
			const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ paymentMethod: newMethod }),
			});

			if (!response.ok) {
				throw new Error("Failed to update payment method");
			}

			toast.success("Método de pagamento atualizado");
		} catch (error) {
			console.error(error);
			toast.error("Erro ao atualizar método de pagamento");
			// Revert on error
			setMethod(currentMethod);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Select
			label="Pagamento"
			placeholder="Selecione o método"
			selectedKeys={[method]}
			onChange={handleSelectionChange}
			isDisabled={loading}
			className="min-w-[180px]"
			size="sm"
			variant="bordered"
		>
			{PAYMENT_METHODS.map((pm) => (
				<SelectItem key={pm.key} value={pm.key}>
					{pm.label}
				</SelectItem>
			))}
		</Select>
	);
}
