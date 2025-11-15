/**
 * Máscaras de formatação para inputs
 */

/**
 * Máscara para CEP: 00000-000
 */
export function maskCEP(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 8);
  
  if (limited.length <= 5) {
    return limited;
  }
  
  return `${limited.slice(0, 5)}-${limited.slice(5)}`;
}

/**
 * Máscara para telefone: (00) 0 0000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 11);
  
  if (limited.length === 0) return "";
  if (limited.length <= 2) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  if (limited.length <= 10) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  }
  
  // Celular com 9 dígitos
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 3)} ${limited.slice(3, 7)}-${limited.slice(7)}`;
}

/**
 * Máscara para CPF: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 11);
  
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  }
  
  return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
}

/**
 * Máscara para CNPJ: 00.000.000/0000-00
 */
export function maskCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 14);
  
  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  }
  if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  }
  
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
}

/**
 * Máscara para CPF ou CNPJ (detecta automaticamente)
 */
export function maskCPFOrCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  
  if (cleaned.length <= 11) {
    return maskCPF(value);
  }
  
  return maskCNPJ(value);
}

/**
 * Remove máscara de um valor formatado
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}

