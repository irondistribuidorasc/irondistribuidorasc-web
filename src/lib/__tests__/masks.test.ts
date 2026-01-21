import { describe, expect, it } from "vitest";
import {
	maskCEP,
	maskCNPJ,
	maskCPF,
	maskCPFOrCNPJ,
	maskPhone,
	maskUF,
	unmask,
} from "../masks";

describe("masks", () => {
	describe("maskCEP", () => {
		it("deve formatar CEP corretamente", () => {
			expect(maskCEP("88220000")).toBe("88220-000");
			expect(maskCEP("12345678")).toBe("12345-678");
			expect(maskCEP("12345")).toBe("12345");
			expect(maskCEP("123")).toBe("123");
		});

		it("deve remover caracteres não numéricos", () => {
			expect(maskCEP("88220-000")).toBe("88220-000");
			expect(maskCEP("abc12345def678")).toBe("12345-678");
		});

		it("deve limitar a 8 dígitos", () => {
			expect(maskCEP("123456789012")).toBe("12345-678");
		});
	});

	describe("maskPhone", () => {
		it("deve formatar telefone fixo corretamente", () => {
			expect(maskPhone("4832221234")).toBe("(48) 3222-1234");
		});

		it("deve formatar celular corretamente", () => {
			expect(maskPhone("48991147117")).toBe("(48) 9 9114-7117");
		});

		it("deve formatar parcialmente", () => {
			expect(maskPhone("48")).toBe("(48");
			expect(maskPhone("489")).toBe("(48) 9");
			expect(maskPhone("48991")).toBe("(48) 991");
		});

		it("deve remover caracteres não numéricos", () => {
			expect(maskPhone("(48) 9 9114-7117")).toBe("(48) 9 9114-7117");
		});

		it("deve limitar a 11 dígitos", () => {
			expect(maskPhone("489911471171234")).toBe("(48) 9 9114-7117");
		});
	});

	describe("maskCPF", () => {
		it("deve formatar CPF corretamente", () => {
			expect(maskCPF("12345678901")).toBe("123.456.789-01");
		});

		it("deve formatar parcialmente", () => {
			expect(maskCPF("123")).toBe("123");
			expect(maskCPF("1234")).toBe("123.4");
			expect(maskCPF("1234567")).toBe("123.456.7");
			expect(maskCPF("123456789")).toBe("123.456.789");
		});

		it("deve remover caracteres não numéricos", () => {
			expect(maskCPF("123.456.789-01")).toBe("123.456.789-01");
		});

		it("deve limitar a 11 dígitos", () => {
			expect(maskCPF("1234567890123456")).toBe("123.456.789-01");
		});
	});

	describe("maskCNPJ", () => {
		it("deve formatar CNPJ corretamente", () => {
			expect(maskCNPJ("12345678000190")).toBe("12.345.678/0001-90");
		});

		it("deve formatar parcialmente", () => {
			expect(maskCNPJ("12")).toBe("12");
			expect(maskCNPJ("123")).toBe("12.3");
			expect(maskCNPJ("123456")).toBe("12.345.6");
			expect(maskCNPJ("123456789")).toBe("12.345.678/9");
			expect(maskCNPJ("12345678901")).toBe("12.345.678/901");
		});

		it("deve remover caracteres não numéricos", () => {
			expect(maskCNPJ("12.345.678/0001-90")).toBe("12.345.678/0001-90");
		});

		it("deve limitar a 14 dígitos", () => {
			expect(maskCNPJ("123456780001901234")).toBe("12.345.678/0001-90");
		});
	});

	describe("maskCPFOrCNPJ", () => {
		it("deve formatar como CPF quando tem até 11 dígitos", () => {
			expect(maskCPFOrCNPJ("12345678901")).toBe("123.456.789-01");
			expect(maskCPFOrCNPJ("123456789")).toBe("123.456.789");
		});

		it("deve formatar como CNPJ quando tem mais de 11 dígitos", () => {
			expect(maskCPFOrCNPJ("12345678000190")).toBe("12.345.678/0001-90");
			expect(maskCPFOrCNPJ("123456780001")).toBe("12.345.678/0001");
		});
	});

	describe("maskUF", () => {
		it("deve formatar UF corretamente", () => {
			expect(maskUF("sc")).toBe("SC");
			expect(maskUF("SP")).toBe("SP");
			expect(maskUF("rj")).toBe("RJ");
		});

		it("deve limitar a 2 caracteres", () => {
			expect(maskUF("Santa Catarina")).toBe("SA");
			expect(maskUF("SCX")).toBe("SC");
		});

		it("deve remover caracteres não alfabéticos", () => {
			expect(maskUF("S1C2")).toBe("SC");
			expect(maskUF("123")).toBe("");
			expect(maskUF("S-C")).toBe("SC");
		});

		it("deve converter para maiúsculas", () => {
			expect(maskUF("sc")).toBe("SC");
			expect(maskUF("Sc")).toBe("SC");
		});
	});

	describe("unmask", () => {
		it("deve remover todas as máscaras", () => {
			expect(unmask("123.456.789-01")).toBe("12345678901");
			expect(unmask("12.345.678/0001-90")).toBe("12345678000190");
			expect(unmask("(48) 9 9114-7117")).toBe("48991147117");
			expect(unmask("88220-000")).toBe("88220000");
		});

		it("deve retornar vazio quando não há dígitos", () => {
			expect(unmask("abc-def/ghi")).toBe("");
		});
	});
});
