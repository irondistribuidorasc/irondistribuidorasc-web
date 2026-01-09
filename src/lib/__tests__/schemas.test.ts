import { describe, expect, it } from "vitest";

import {
	forgotPasswordSchema,
	loginSchema,
	passwordSchema,
	registerApiSchema,
	registerSchema,
	resetPasswordSchema,
} from "../schemas";

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
