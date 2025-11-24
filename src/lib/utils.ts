/**
 * Formata um número como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

/**
 * Formata um CEP no padrão brasileiro (00000-000)
 */
export function formatCEP(cep: string): string {
	const cleanCEP = cep.replace(/\D/g, "");
	return cleanCEP.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * Formata um telefone no padrão brasileiro
 */
export function formatPhone(phone: string): string {
	const cleanPhone = phone.replace(/\D/g, "");
	if (cleanPhone.length === 11) {
		return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	}
	if (cleanPhone.length === 10) {
		return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
	return phone;
}
