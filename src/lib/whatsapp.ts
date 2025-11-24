import type { CartItem } from "@/src/contexts/CartContext";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5500000000000";

export function buildOrderWhatsAppMessage(
  items: CartItem[],
  customer: { name: string; city?: string; state?: string; notes?: string }
) {
  const name = customer.name?.trim() || "-";
  const city = customer.city?.trim() || "-";
  const state = customer.state?.trim().toUpperCase() || "-";
  const notes = customer.notes?.trim() || "-";

  const header = "Olá, gostaria de fazer um pedido:";
  const lines = items.map(
    (item) =>
      `- ${item.quantity}x ${item.product.name} (${
        item.product.brand
      } - ${item.product.model.toUpperCase()})`
  );
  const customerBlock = [
    `Dados do cliente:`,
    `- Nome: ${name}`,
    `- Cidade/UF: ${city}/${state}`,
    `- Observações: ${notes}`,
  ];
  const footer = `Enviado via site ${process.env.NEXT_PUBLIC_APP_URL || "b2b-template"}`;

  return [header, "Itens:", ...lines, "", ...customerBlock, "", footer]
    .filter(Boolean)
    .join("\n");
}

export function buildWarrantyWhatsAppMessage(payload: {
  requestType: string;
  itemType: string;
  model: string;
  description: string;
}) {
  const header = "Olá, gostaria de solicitar GARANTIA/TROCA:";
  const lines = [
    `- Tipo: ${payload.requestType}`,
    `- Item: ${payload.itemType}`,
    `- Modelo do aparelho: ${payload.model}`,
    `- Descrição do problema: ${payload.description}`,
    "",
    `Enviado via site ${process.env.NEXT_PUBLIC_APP_URL || "b2b-template"}`,
  ];

  return [header, ...lines].join("\n");
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
