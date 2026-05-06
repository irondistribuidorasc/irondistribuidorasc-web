import { describe, expect, it } from "vitest";

import {
	bulkUpdateSchema,
	forgotPasswordSchema,
	loginSchema,
	passwordSchema,
	productSchema,
	createOrderCustomerSchema,
	createOrderItemSchema,
	createOrderSchema,
	orderFeedbackSchema,
	registerApiSchema,
	registerSchema,
	resetPasswordSchema,
} from "../schemas";

describe("productSchema", () => {
  const validProductInput = {
    code: "LEN-SAM-A52",
    name: "Lente Samsung A52",
    brand: "Samsung",
    category: "lens",
    model: "A52",
    imageUrl: "/logo-iron.webp",
    stockQuantity: 5,
    minStockThreshold: 2,
    price: 19.9,
    description: "Lente de câmera para reposição",
    tags: ["camera"],
    popularity: 10,
  };

  it("aceita a categoria lens", () => {
    const result = productSchema.safeParse(validProductInput);

    expect(result.success).toBe(true);
  });

  it("normaliza categoria com espaços e maiúsculas", () => {
    const result = productSchema.safeParse({
      ...validProductInput,
      category: " Lens ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.category).toBe("lens");
  });

  it("rejeita categorias fora da lista canônica", () => {
    const result = productSchema.safeParse({
      ...validProductInput,
      category: "invalid_category",
    });

    expect(result.success).toBe(false);
  });

  it("aceita restockDate válida e rejeita data inválida", () => {
    const validResult = productSchema.safeParse({
      ...validProductInput,
      restockDate: "2026-05-01",
    });

    expect(validResult.success).toBe(true);

    const invalidResult = productSchema.safeParse({
      ...validProductInput,
      restockDate: "not-a-date",
    });

    expect(invalidResult.success).toBe(false);
  });
});

describe("schemas", () => {
	it("passwordSchema valida requisitos", () => {
		expect(() => passwordSchema.parse("Aa1!aaaa")).not.toThrow();
		expect(() => passwordSchema.parse("short")).toThrow();
		expect(() => passwordSchema.parse("aaaaaaaa")).toThrow(); // sem maiúscula, número e especial
	});

	it("loginSchema valida email e senha", () => {
		expect(() =>
			loginSchema.parse({ email: "a@b.com", password: "x" }),
		).not.toThrow();
		expect(() =>
			loginSchema.parse({ email: "invalido", password: "x" }),
		).toThrow();
	});

	it("registerSchema exige confirmPassword igual e acceptedTerms true", () => {
		const base = {
			name: "Fulano",
			email: "fulano@exemplo.com",
			password: "Aa1!aaaa",
			confirmPassword: "Aa1!aaaa",
			acceptedTerms: true as const,
		};
		expect(() => registerSchema.parse(base)).not.toThrow();
		expect(() =>
			registerSchema.parse({ ...base, confirmPassword: "diferente" }),
		).toThrow();
		// Deve exigir acceptedTerms como true
		expect(() =>
			registerSchema.parse({ ...base, acceptedTerms: false }),
		).toThrow();
	});

	it("registerApiSchema não exige confirmPassword", () => {
		expect(() =>
			registerApiSchema.parse({
				name: "Fulano",
				email: "fulano@exemplo.com",
				password: "Aa1!aaaa",
				phone: null,
				docNumber: null,
			}),
		).not.toThrow();
	});

	it("forgot/reset schemas validam email e confirmação", () => {
		expect(() =>
			forgotPasswordSchema.parse({ email: "a@b.com" }),
		).not.toThrow();
		expect(() => forgotPasswordSchema.parse({ email: "x" })).toThrow();

		expect(() =>
			resetPasswordSchema.parse({
				newPassword: "Aa1!aaaa",
				confirmPassword: "Aa1!aaaa",
			}),
		).not.toThrow();
		expect(() =>
			resetPasswordSchema.parse({
				newPassword: "Aa1!aaaa",
				confirmPassword: "dif",
			}),
		).toThrow();
	});
});

describe("order schemas", () => {
	const validItem = {
		productId: "prod-1",
		productCode: "P001",
		productName: "Produto 1",
		quantity: 2,
		price: 19.9,
	};

	const validCustomer = {
		name: "Maria",
		email: "maria@example.com",
		phone: "47999999999",
		addressLine1: "Rua 1",
		city: "Itapema",
		state: "SC",
		postalCode: "88220-000",
	};

	it("createOrderItemSchema valida item e rejeita quantidade inválida", () => {
		expect(createOrderItemSchema.safeParse(validItem).success).toBe(true);
		expect(
			createOrderItemSchema.safeParse({
				...validItem,
				quantity: 0,
			}).success,
		).toBe(false);
	});

	it("createOrderCustomerSchema valida customer e rejeita telefone inválido", () => {
		expect(createOrderCustomerSchema.safeParse(validCustomer).success).toBe(true);
		expect(
			createOrderCustomerSchema.safeParse({
				...validCustomer,
				phone: "123",
			}).success,
		).toBe(false);
	});

	it("createOrderSchema valida pedido completo", () => {
		expect(
			createOrderSchema.safeParse({
				items: [validItem],
				customer: validCustomer,
				notes: "Entregar na portaria",
				paymentMethod: "PIX",
			}).success,
		).toBe(true);
		expect(
			createOrderSchema.safeParse({
				items: [],
				customer: validCustomer,
			}).success,
		).toBe(false);
	});

	it("bulkUpdateSchema valida lote e rejeita lote vazio", () => {
		expect(
			bulkUpdateSchema.safeParse({
				updates: [
					{
						id: "prod-1",
						stockQuantity: 10,
						minStockThreshold: 3,
					},
				],
			}).success,
		).toBe(true);
		expect(bulkUpdateSchema.safeParse({ updates: [] }).success).toBe(false);
	});

	it("orderFeedbackSchema valida nota e comentário", () => {
		expect(
			orderFeedbackSchema.safeParse({
				rating: 5,
				comment: "Pedido ok",
			}).success,
		).toBe(true);
		expect(
			orderFeedbackSchema.safeParse({
				rating: 6,
				comment: "Nota inválida",
			}).success,
		).toBe(false);
	});
});
