import type { CartItem } from "@/src/contexts/CartContext";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5548991147117";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
	PIX: "Pix",
	CREDIT_CARD: "Cartão de Crédito",
	DEBIT_CARD: "Cartão de Débito",
	CASH: "Dinheiro",
	OTHER: "Outro",
};

function getPaymentMethodLabel(method?: string): string {
	return PAYMENT_METHOD_LABELS[method || ""] || "Não informado";
}

export function buildOrderWhatsAppMessage(
	items: CartItem[],
	customer: {
		name: string;
		city?: string;
		state?: string;
		notes?: string;
		paymentMethod?: string;
	},
	orderId?: string | number,
) {
	const name = customer.name?.trim() || "-";
	const city = customer.city?.trim() || "-";
	const state = customer.state?.trim().toUpperCase() || "-";
	const notes = customer.notes?.trim() || "-";
	const paymentMethod = getPaymentMethodLabel(customer.paymentMethod);

	const header = orderId
		? `Olá, gostaria de finalizar o pedido #${orderId}:`
		: `Olá, gostaria de fazer um pedido:`;
	const lines = items.map(
		(item) =>
			`- ${item.quantity}x ${item.product.name} (${
				item.product.brand
			} - ${item.product.model.toUpperCase()})`,
	);
	const customerBlock = [
		`*Dados do cliente:*`,
		`Nome: ${name}`,
		`Cidade/UF: ${city}/${state}`,
		`Pagamento: ${paymentMethod}`,
		`Observações: ${notes}`,
	];
	const footer = `Enviado via site irondistribuidorasc.com.br`;

	return [header, "", `*Itens:*`, ...lines, "", ...customerBlock, "", footer]
		.filter(Boolean)
		.join("\n");
}

export function buildWarrantyWhatsAppMessage(payload: {
	requestType: string;
	itemType: string;
	model: string;
	description: string;
}) {
	const header = `Olá, gostaria de solicitar GARANTIA/TROCA:`;
	const lines = [
		`Tipo: ${payload.requestType}`,
		`Item: ${payload.itemType}`,
		`Modelo do aparelho: ${payload.model}`,
		`Descrição do problema: ${payload.description}`,
		"",
		`Enviado via site irondistribuidorasc.com.br`,
	];

	return [header, ...lines].join("\n");
}

export function getWhatsAppUrl(message: string) {
	return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
