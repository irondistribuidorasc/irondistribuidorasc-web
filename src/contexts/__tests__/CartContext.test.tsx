import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/src/data/products";
import { CartProvider, useCart } from "../CartContext";

const useSessionMock = vi.fn();

vi.mock("next-auth/react", () => ({
	useSession: () => useSessionMock(),
}));

beforeEach(() => {
	cleanup();
	useSessionMock.mockReset();
});

afterEach(() => {
	cleanup();
});

function makeProduct(overrides: Partial<Product> = {}): Product {
	return {
		id: "p1",
		code: "CODE-1",
		name: "Produto 1",
		brand: "Samsung",
		category: "display",
		model: "A01",
		imageUrl: "/logo-iron.png",
		inStock: true,
		price: 10,
		...overrides,
	};
}

function TestConsumer({ product }: { product: Product }) {
	const {
		totalItems,
		items,
		customer,
		isCartOpen,
		addItem,
		removeItem,
		updateQuantity,
		updateCustomer,
		openCart,
		closeCart,
		clearCart,
	} = useCart();

	const qty = items.find((i) => i.product.id === product.id)?.quantity ?? 0;

	return (
		<div>
			<div data-testid="total">{totalItems}</div>
			<div data-testid="qty">{qty}</div>
			<div data-testid="customer-name">{customer.name}</div>
			<div data-testid="cart-open">{String(isCartOpen)}</div>

			<button onClick={() => addItem(product)}>add</button>
			<button onClick={() => addItem(product)}>add2</button>
			<button onClick={() => updateQuantity(product.id, 0)}>qty0</button>
			<button onClick={() => removeItem(product.id)}>remove</button>
			<button onClick={() => updateCustomer({ name: "Manual" })}>
				setname
			</button>
			<button onClick={() => openCart()}>open</button>
			<button onClick={() => closeCart()}>close</button>
			<button onClick={() => clearCart()}>clear</button>
		</div>
	);
}

describe("CartContext", () => {
	it("auto-preenche customer com dados da session e manipula itens", async () => {
		useSessionMock.mockReturnValue({
			data: {
				user: {
					name: "João",
					phone: "48991147117",
					docNumber: "12345678901",
					addressLine1: "Rua 1",
					addressLine2: "",
					city: "Florianópolis",
					state: "SC",
					postalCode: "88000000",
				},
			},
		});

		const user = userEvent.setup();
		const product = makeProduct({ id: "p1", name: "P1" });

		render(
			<CartProvider>
				<TestConsumer product={product} />
			</CartProvider>,
		);

		expect(await screen.findByTestId("customer-name")).toHaveTextContent(
			"João",
		);

		expect(screen.getByTestId("total")).toHaveTextContent("0");
		await user.click(screen.getByText("add"));
		expect(screen.getByTestId("total")).toHaveTextContent("1");
		expect(screen.getByTestId("qty")).toHaveTextContent("1");

		// adiciona novamente -> incrementa quantidade
		await user.click(screen.getByText("add2"));
		expect(screen.getByTestId("total")).toHaveTextContent("2");
		expect(screen.getByTestId("qty")).toHaveTextContent("2");

		// abre/fecha carrinho
		await user.click(screen.getByText("open"));
		expect(screen.getByTestId("cart-open")).toHaveTextContent("true");
		await user.click(screen.getByText("close"));
		expect(screen.getByTestId("cart-open")).toHaveTextContent("false");

		// set quantity 0 remove item
		await user.click(screen.getByText("qty0"));
		expect(screen.getByTestId("total")).toHaveTextContent("0");
		expect(screen.getByTestId("qty")).toHaveTextContent("0");

		// re-add e remove
		await user.click(screen.getByText("add"));
		expect(screen.getByTestId("total")).toHaveTextContent("1");
		await user.click(screen.getByText("remove"));
		expect(screen.getByTestId("total")).toHaveTextContent("0");

		// clear volta ao estado inicial
		await user.click(screen.getByText("add"));
		await user.click(screen.getByText("clear"));
		expect(screen.getByTestId("total")).toHaveTextContent("0");
	});

	it("não atualiza customer quando session é null", async () => {
		useSessionMock.mockReturnValue({
			data: null,
		});

		const product = makeProduct({ id: "p1", name: "P1" });

		render(
			<CartProvider>
				<TestConsumer product={product} />
			</CartProvider>,
		);

		// Customer deve estar vazio
		expect(screen.getByTestId("customer-name")).toHaveTextContent("");
	});

	it("useCart lança erro fora do provider", () => {
		// evita erro no console por boundary
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		function Broken() {
			useCart();
			return null;
		}

		expect(() => render(<Broken />)).toThrow(
			/useCart deve ser usado dentro de CartProvider/,
		);
		spy.mockRestore();
	});
});
