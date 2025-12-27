import { describe, expect, it } from "vitest";

import type { CartItem } from "@/src/contexts/CartContext";
import type { Product } from "@/src/data/products";
import {
	buildOrderWhatsAppMessage,
	buildWarrantyWhatsAppMessage,
	getWhatsAppUrl,
} from "../whatsapp";

function makeProduct(overrides: Partial<Product> = {}): Product {
	return {
		id: "p1",
		code: "CODE-1",
		name: "Display Samsung A02",
		brand: "Samsung",
		category: "display",
		model: "a02",
		imageUrl: "/logo-iron.png",
		inStock: true,
		price: 89.9,
		...overrides,
	};
}

describe("whatsapp", () => {
	it("monta mensagem de pedido com orderId", () => {
		const items: CartItem[] = [
			{ product: makeProduct({ model: "a02" }), quantity: 2 },
			{
				product: makeProduct({ id: "p2", model: "redmi 12", brand: "Xiaomi" }),
				quantity: 1,
			},
		];

		const message = buildOrderWhatsAppMessage(
			items,
			{
				name: "  João  ",
				city: "  Florianópolis ",
				state: " sc ",
				notes: "  ok  ",
				paymentMethod: "PIX",
			},
			"123",
		);

		expect(message).toContain("pedido #123");
		expect(message).toContain("2x Display Samsung A02 (Samsung - A02)");
		expect(message).toContain("1x Display Samsung A02 (Xiaomi - REDMI 12)");
		expect(message).toContain("Nome: João");
		expect(message).toContain("Florianópolis/SC");
		expect(message).toContain("Pagamento: Pix");
		expect(message).toContain("Observações: ok");
		expect(message).toContain("Enviado via site irondistribuidorasc.com.br");
	});

	it("monta mensagem de pedido sem orderId e com defaults", () => {
		const items: CartItem[] = [{ product: makeProduct(), quantity: 1 }];
		const message = buildOrderWhatsAppMessage(items, { name: "" });
		expect(message).toContain("gostaria de fazer um pedido");
		expect(message).toContain("Nome: -");
		expect(message).toContain("Cidade/UF: -/-");
		expect(message).toContain("Pagamento: Não informado");
	});

	it("monta mensagem de garantia", () => {
		const msg = buildWarrantyWhatsAppMessage({
			requestType: "Troca",
			itemType: "Display",
			model: "A10",
			description: "Não liga",
		});
		expect(msg).toContain("GARANTIA/TROCA");
		expect(msg).toContain("Tipo: Troca");
		expect(msg).toContain("Item: Display");
		expect(msg).toContain("Modelo do aparelho: A10");
		expect(msg).toContain("Descrição do problema: Não liga");
	});

	it("gera URL do WhatsApp com encode", () => {
		const url = getWhatsAppUrl("Olá mundo");
		expect(url).toContain("https://wa.me/");
		expect(url).toContain("text=");
		expect(url).toContain(encodeURIComponent("Olá mundo"));
	});
});
