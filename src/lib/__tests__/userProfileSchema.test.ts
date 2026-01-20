import { describe, expect, it } from "vitest";

import { userProfileSchema } from "../schemas/user";

describe("userProfileSchema", () => {
	it("aceita payload mínimo e strings vazias opcionais", () => {
		expect(() =>
			userProfileSchema.parse({
				name: "Fulano",
				email: "fulano@exemplo.com",
				phone: "",
				docNumber: "",
				addressLine1: "",
				city: "",
				state: "",
				postalCode: "",
				storeName: "",
				storePhone: "",
				tradeLicense: "",
			}),
		).not.toThrow();
	});

	it("rejeita campos inválidos quando preenchidos", () => {
		expect(() =>
			userProfileSchema.parse({
				name: "Fu",
				email: "x",
				phone: "123",
				state: "S",
				postalCode: "1",
			}),
		).toThrow();
	});
});
