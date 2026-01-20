import { describe, expect, it } from "vitest";

import {
	isValidDocNumber,
	isValidEmail,
	isValidPhone,
	isValidPostalCode,
	isValidState,
	MIN_PASSWORD_LENGTH,
	normalizeEmail,
	normalizeOptionalString,
	validateMaxLength,
	validatePassword,
} from "../validation";

describe("validation", () => {
	describe("isValidEmail", () => {
		it("valida email com trim", () => {
			expect(isValidEmail("  teste@exemplo.com ")).toBe(true);
			expect(isValidEmail("teste@exemplo.com")).toBe(true);
		});

		it("rejeita emails inválidos", () => {
			expect(isValidEmail("")).toBe(false);
			expect(isValidEmail("teste@")).toBe(false);
			expect(isValidEmail("teste@exemplo")).toBe(false);
			expect(isValidEmail("teste.exemplo.com")).toBe(false);
		});
	});

	describe("normalizeEmail", () => {
		it("normaliza para lowercase e trim", () => {
			expect(normalizeEmail("  TeStE@ExEmPlO.Com  ")).toBe("teste@exemplo.com");
		});

		it("retorna vazio para valores inválidos", () => {
			expect(normalizeEmail("" as unknown as string)).toBe("");
			expect(normalizeEmail(null as unknown as string)).toBe("");
		});
	});

	describe("normalizeOptionalString", () => {
		it("retorna null para não-string ou string vazia", () => {
			expect(normalizeOptionalString(123)).toBeNull();
			expect(normalizeOptionalString("   ")).toBeNull();
		});

		it("retorna string trim quando aplicável", () => {
			expect(normalizeOptionalString("  abc  ")).toBe("abc");
		});
	});

	describe("isValidPhone", () => {
		it("aceita null/undefined como válido (opcional)", () => {
			expect(isValidPhone(null)).toBe(true);
			expect(isValidPhone(undefined as unknown as string | null)).toBe(true);
		});

		it("valida tamanho e caracteres", () => {
			expect(isValidPhone("(48) 9 9114-7117")).toBe(true);
			expect(isValidPhone("4832221234")).toBe(true);
			expect(isValidPhone("abc")).toBe(false);
			expect(isValidPhone("123")).toBe(false);
		});
	});

	describe("isValidDocNumber", () => {
		it("aceita null como válido (opcional)", () => {
			expect(isValidDocNumber(null)).toBe(true);
		});

		it("valida CPF/CNPJ com ou sem máscara", () => {
			expect(isValidDocNumber("12345678901")).toBe(true);
			expect(isValidDocNumber("123.456.789-01")).toBe(true);
			expect(isValidDocNumber("12345678000190")).toBe(true);
			expect(isValidDocNumber("12.345.678/0001-90")).toBe(true);
			expect(isValidDocNumber("123")).toBe(false);
		});
	});

	describe("isValidPostalCode", () => {
		it("aceita null como válido (opcional)", () => {
			expect(isValidPostalCode(null)).toBe(true);
		});

		it("valida CEP com e sem hífen", () => {
			expect(isValidPostalCode("12345-678")).toBe(true);
			expect(isValidPostalCode("12345678")).toBe(true);
			expect(isValidPostalCode("1234")).toBe(false);
		});
	});

	describe("isValidState", () => {
		it("aceita null como válido (opcional)", () => {
			expect(isValidState(null)).toBe(true);
		});

		it("valida UF com 2 letras", () => {
			expect(isValidState("sc")).toBe(true);
			expect(isValidState("SC")).toBe(true);
			expect(isValidState("S")).toBe(false);
			expect(isValidState("SCO")).toBe(false);
		});
	});

	describe("validatePassword", () => {
		it("requer senha", () => {
			expect(validatePassword("" as unknown as string)).toEqual({
				valid: false,
				message: "Senha é obrigatória.",
			});
		});

		it("requer tamanho mínimo", () => {
			const res = validatePassword("1234567");
			expect(res.valid).toBe(false);
			expect(res.message).toContain(`${MIN_PASSWORD_LENGTH}`);
		});

		it("aceita senha válida", () => {
			expect(validatePassword("12345678")).toEqual({ valid: true });
		});
	});

	describe("validateMaxLength", () => {
		it("aceita vazio", () => {
			expect(validateMaxLength(null, 10, "Campo")).toEqual({ valid: true });
			expect(validateMaxLength(undefined, 10, "Campo")).toEqual({
				valid: true,
			});
		});

		it("rejeita quando excede max", () => {
			const res = validateMaxLength("123456", 5, "Campo");
			expect(res.valid).toBe(false);
			expect(res.message).toContain("Campo");
			expect(res.message).toContain("5");
		});

		it("aceita quando está no limite", () => {
			expect(validateMaxLength("12345", 5, "Campo")).toEqual({ valid: true });
		});
	});
});
