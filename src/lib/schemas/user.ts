import {
  isValidDocNumber,
  isValidPhone,
  isValidPostalCode,
} from "../validation";
import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional(), // Read-only mostly, but good to have validation if we ever allow change
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || isValidPhone(val), "Telefone inválido"),
  docNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || isValidDocNumber(val),
      "CPF/CNPJ inválido"
    ),
  addressLine1: z.string().min(5, "Endereço muito curto").optional().or(z.literal("")),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "Cidade inválida").optional().or(z.literal("")),
  state: z.string().length(2, "Estado deve ter 2 letras").optional().or(z.literal("")),
  postalCode: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || isValidPostalCode(val), "CEP inválido"),
  storeName: z.string().min(3, "Nome da loja deve ter pelo menos 3 caracteres").optional().or(z.literal("")),
  storePhone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || isValidPhone(val), "Telefone comercial inválido"),
  tradeLicense: z.string().optional().or(z.literal("")),
});

export type UserProfileSchema = z.infer<typeof userProfileSchema>;
