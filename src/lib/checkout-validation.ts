export type CheckoutCustomerValidationInput = {
  name: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  paymentMethod: string;
};

type RequiredCheckoutField = {
  key: keyof CheckoutCustomerValidationInput;
  label: string;
};

const VALID_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const REQUIRED_CHECKOUT_FIELDS: RequiredCheckoutField[] = [
  { key: "name", label: "nome" },
  { key: "phone", label: "telefone" },
  { key: "addressLine1", label: "endereço" },
  { key: "city", label: "cidade" },
  { key: "state", label: "estado" },
  { key: "postalCode", label: "CEP" },
  { key: "paymentMethod", label: "forma de pagamento" },
];

export function isValidCheckoutState(state: string) {
  return VALID_STATES.has(state.trim().toUpperCase());
}

export function getMissingCheckoutFields(
  customer: CheckoutCustomerValidationInput
) {
  return REQUIRED_CHECKOUT_FIELDS.filter(
    ({ key }) => !customer[key].trim()
  ).map(({ label }) => label);
}

export function isCheckoutCustomerReady(
  customer: CheckoutCustomerValidationInput
) {
  return (
    getMissingCheckoutFields(customer).length === 0 &&
    isValidCheckoutState(customer.state)
  );
}

export function getCheckoutValidationMessage(
  customer: CheckoutCustomerValidationInput
) {
  if (customer.state.trim() && !isValidCheckoutState(customer.state)) {
    return "UF inválida. Informe uma sigla de estado válida (ex: SC, SP, RJ).";
  }

  const missingFields = getMissingCheckoutFields(customer);
  if (missingFields.length === 0) {
    return undefined;
  }

  return `Preencha os campos obrigatórios: ${formatFieldList(missingFields)}.`;
}

function formatFieldList(fields: string[]) {
  if (fields.length <= 1) {
    return fields[0] ?? "";
  }

  return `${fields.slice(0, -1).join(", ")} e ${fields[fields.length - 1]}`;
}
