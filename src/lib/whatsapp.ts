import type { CartItem } from "@/src/contexts/CartContext";

const PHONE_NUMBER = "5548991147117";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  OTHER: "Outro",
};

// Emojis usando escape sequences para evitar problemas de encoding
const EMOJI = {
  wave: "\u{1F44B}", // 👋
  cart: "\u{1F6D2}", // 🛒
  person: "\u{1F464}", // 👤
  pin: "\u{1F4CD}", // 📍
  card: "\u{1F4B3}", // 💳
  memo: "\u{1F4DD}", // 📝
  rocket: "\u{1F680}", // 🚀
  bullet: "\u{25AA}\u{FE0F}", // ▪️
  tools: "\u{1F6E0}\u{FE0F}", // 🛠️
  clipboard: "\u{1F4CB}", // 📋
  package: "\u{1F4E6}", // 📦
  phone: "\u{1F4F1}", // 📱
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
  orderId?: string | number
) {
  const name = customer.name?.trim() || "-";
  const city = customer.city?.trim() || "-";
  const state = customer.state?.trim().toUpperCase() || "-";
  const notes = customer.notes?.trim() || "-";
  const paymentMethod = getPaymentMethodLabel(customer.paymentMethod);

  const header = orderId
    ? `${EMOJI.wave} Olá, gostaria de finalizar o pedido #${orderId}:`
    : `${EMOJI.wave} Olá, gostaria de fazer um pedido:`;
  const lines = items.map(
    (item) =>
      `${EMOJI.bullet} ${item.quantity}x ${item.product.name} (${
        item.product.brand
      } - ${item.product.model.toUpperCase()})`
  );
  const customerBlock = [
    `${EMOJI.person} *Dados do cliente:*`,
    `${EMOJI.person} Nome: ${name}`,
    `${EMOJI.pin} Cidade/UF: ${city}/${state}`,
    `${EMOJI.card} Pagamento: ${paymentMethod}`,
    `${EMOJI.memo} Observações: ${notes}`,
  ];
  const footer = `${EMOJI.rocket} Enviado via site irondistribuidorasc.com.br`;

  return [
    header,
    "",
    `${EMOJI.cart} *Itens:*`,
    ...lines,
    "",
    ...customerBlock,
    "",
    footer,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWarrantyWhatsAppMessage(payload: {
  requestType: string;
  itemType: string;
  model: string;
  description: string;
}) {
  const header = `${EMOJI.tools} Olá, gostaria de solicitar GARANTIA/TROCA:`;
  const lines = [
    `${EMOJI.clipboard} Tipo: ${payload.requestType}`,
    `${EMOJI.package} Item: ${payload.itemType}`,
    `${EMOJI.phone} Modelo do aparelho: ${payload.model}`,
    `${EMOJI.memo} Descrição do problema: ${payload.description}`,
    "",
    `${EMOJI.rocket} Enviado via site irondistribuidorasc.com.br`,
  ];

  return [header, ...lines].join("\n");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
