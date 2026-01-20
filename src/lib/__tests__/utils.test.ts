import { describe, expect, it } from "vitest";

import { formatCEP, formatCurrency, formatPhone } from "../utils";

describe("utils", () => {
	it("formatCurrency formata em BRL", () => {
		const formatted = formatCurrency(10);
		expect(formatted).toContain("R$");
	});

	it("formatCEP aplica máscara 00000-000", () => {
		expect(formatCEP("88220000")).toBe("88220-000");
		expect(formatCEP("88220-000")).toBe("88220-000");
	});

	it("formatPhone formata fixo e celular", () => {
		expect(formatPhone("4832221234")).toBe("(48) 3222-1234");
		expect(formatPhone("48991147117")).toBe("(48) 99114-7117");
		expect(formatPhone("abc")).toBe("abc");
	});
});
