import { describe, expect, it } from "vitest";

import {
	forgotPasswordSchema,
	loginSchema,
	passwordSchema,
	productSchema,
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
    imageUrl: "/logo-iron.png",
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
