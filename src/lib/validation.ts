export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s()+-]+$/;
const CPF_REGEX = /^\d{11}$/;
const CNPJ_REGEX = /^\d{14}$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const STATE_REGEX = /^[A-Z]{2}$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function isValidPhone(phone: string | null): boolean {
  if (!phone) return true;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15 && PHONE_REGEX.test(phone);
}

export function isValidDocNumber(docNumber: string | null): boolean {
  if (!docNumber) return true;
  const cleaned = docNumber.replace(/\D/g, "");
  return CPF_REGEX.test(cleaned) || CNPJ_REGEX.test(cleaned);
}

export function isValidPostalCode(postalCode: string | null): boolean {
  if (!postalCode) return true;
  return CEP_REGEX.test(postalCode.trim());
}

export function isValidState(state: string | null): boolean {
  if (!state) return true;
  return STATE_REGEX.test(state.trim().toUpperCase());
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Senha é obrigatória." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  return { valid: true };
}

// Limites de comprimento baseados no schema Prisma (VARCHAR padrão = 255)
export const MAX_TEXT_LENGTH = 255;
export const MAX_NAME_LENGTH = 255;
export const MAX_ADDRESS_LENGTH = 255;
export const MAX_CITY_LENGTH = 100;
export const MAX_POSTAL_CODE_LENGTH = 20;
export const MAX_PHONE_LENGTH = 30;
export const MAX_DOC_NUMBER_LENGTH = 20;

export function validateMaxLength(
  value: string | null | undefined,
  maxLength: number,
  fieldName: string
): { valid: boolean; message?: string } {
  if (!value) return { valid: true };
  if (value.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} deve ter no máximo ${maxLength} caracteres.`,
    };
  }
  return { valid: true };
}

