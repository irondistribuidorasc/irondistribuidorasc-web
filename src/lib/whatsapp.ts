import type { CartItem } from "@/src/contexts/CartContext";

const PHONE_NUMBER = "5548991147117";

export function buildOrderWhatsAppMessage(
  items: CartItem[],
  customer: { name: string; city?: string; state?: string; notes?: string }
) {
  const name = customer.name?.trim() || "-";
  const city = customer.city?.trim() || "-";
  const state = customer.state?.trim().toUpperCase() || "-";
  const notes = customer.notes?.trim() || "-";

  const header = "\uD83D\uDC4B Olá, gostaria de fazer um pedido:";
  const lines = items.map(
    (item) =>
      `\u25AA\uFE0F ${item.quantity}x ${item.product.name} (${
        item.product.brand
      } - ${item.product.model.toUpperCase()})`
  );
  const customerBlock = [
    `\uD83D\uDC64 *Dados do cliente:*`,
    `\uD83D\uDC64 Nome: ${name}`,
    `\uD83D\uDCCD Cidade/UF: ${city}/${state}`,
    `\uD83D\uDCDD Observações: ${notes}`,
  ];
  const footer = "\uD83D\uDE80 Enviado via site irondistribuidorasc.com.br";

  return [
    header,
    "",
    "\uD83D\uDED2 *Itens:*",
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
  const header =
    "\uD83D\uDEE0\uFE0F Olá, gostaria de solicitar GARANTIA/TROCA:";
  const lines = [
    `\uD83D\uDCCB Tipo: ${payload.requestType}`,
    `\uD83D\uDCE6 Item: ${payload.itemType}`,
    `\uD83D\uDCF1 Modelo do aparelho: ${payload.model}`,
    `\uD83D\uDCDD Descrição do problema: ${payload.description}`,
    "",
    "\uD83D\uDE80 Enviado via site irondistribuidorasc.com.br",
  ];

  return [header, ...lines].join("\n");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
