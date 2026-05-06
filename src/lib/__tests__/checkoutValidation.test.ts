import { describe, expect, it } from "vitest";

import {
  getCheckoutValidationMessage,
  getMissingCheckoutFields,
  isCheckoutCustomerReady,
} from "../checkout-validation";

const completeCustomer = {
  name: "Cliente Teste",
  phone: "(48) 9 9999-9999",
  addressLine1: "Rua Central, 100",
  city: "Itapema",
  state: "SC",
  postalCode: "88220-000",
  paymentMethod: "PIX",
};

describe("checkout validation", () => {
  it("aceita cliente com campos obrigatórios do checkout preenchidos", () => {
    expect(isCheckoutCustomerReady(completeCustomer)).toBe(true);
    expect(getMissingCheckoutFields(completeCustomer)).toEqual([]);
    expect(getCheckoutValidationMessage(completeCustomer)).toBeUndefined();
  });

  it("rejeita checkout sem telefone, endereço e CEP exigidos pela API", () => {
    const customer = {
      ...completeCustomer,
      phone: "",
      addressLine1: " ",
      postalCode: "",
    };

    expect(isCheckoutCustomerReady(customer)).toBe(false);
    expect(getMissingCheckoutFields(customer)).toEqual([
      "telefone",
      "endereço",
      "CEP",
    ]);
    expect(getCheckoutValidationMessage(customer)).toBe(
      "Preencha os campos obrigatórios: telefone, endereço e CEP."
    );
  });

  it("formata a mensagem quando só um campo está ausente", () => {
    const customer = {
      ...completeCustomer,
      phone: "",
    };

    expect(getMissingCheckoutFields(customer)).toEqual(["telefone"]);
    expect(getCheckoutValidationMessage(customer)).toBe(
      "Preencha os campos obrigatórios: telefone."
    );
  });

  it("rejeita UF inexistente mesmo com dois caracteres", () => {
    const customer = {
      ...completeCustomer,
      state: "XX",
    };

    expect(isCheckoutCustomerReady(customer)).toBe(false);
    expect(getCheckoutValidationMessage(customer)).toBe(
      "UF inválida. Informe uma sigla de estado válida (ex: SC, SP, RJ)."
    );
  });

  it("mantém forma de pagamento como obrigatória no checkout", () => {
    const customer = {
      ...completeCustomer,
      paymentMethod: "",
    };

    expect(isCheckoutCustomerReady(customer)).toBe(false);
    expect(getMissingCheckoutFields(customer)).toEqual(["forma de pagamento"]);
  });
});
