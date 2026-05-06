import { isCategory } from "@/src/data/products";
import {
  isValidDocNumber,
  isValidPhone,
  isValidPostalCode,
} from "./validation";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/\d/, "A senha deve conter pelo menos um número")
  .regex(
    /[^A-Za-z0-9\s]/,
    "A senha deve conter pelo menos um caractere especial"
  );

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Schema para validação no cliente (formulário de registro)
export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || isValidPhone(val), "Telefone inválido"),
    docNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || isValidDocNumber(val),
        "CPF/CNPJ inválido"
      ),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true, {
      message: "Você deve aceitar os Termos de Uso e Política de Privacidade",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Schema para validação na API (não precisa de confirmPassword)
export const registerApiSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || isValidPhone(val), "Telefone inválido"),
  docNumber: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || isValidDocNumber(val),
      "CPF/CNPJ inválido"
    ),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const createOrderItemSchema = z.object({
  productId: z.string().min(1),
  productCode: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export const createOrderCustomerSchema = z.object({
  name: z.string().min(1, "Nome do cliente é obrigatório"),
  email: z.string().email("Email do cliente inválido"),
  phone: z
    .string()
    .min(1, "Telefone do cliente é obrigatório")
    .refine(isValidPhone, "Telefone inválido"),
  docNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidDocNumber(val),
      "CPF/CNPJ inválido"
    ),
  addressLine1: z.string().min(1, "Endereço é obrigatório"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  postalCode: z
    .string()
    .min(1, "CEP é obrigatório")
    .refine(isValidPostalCode, "CEP inválido"),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, "Pedido deve conter ao menos um item"),
  customer: createOrderCustomerSchema,
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "OTHER"]).optional(),
});

export const productSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  category: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Categoria é obrigatória")
    .refine((value) => isCategory(value), "Categoria inválida"),
  model: z.string().min(1, "Modelo é obrigatório"),
  imageUrl: z.string().default("/logo-iron.webp"),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  minStockThreshold: z.coerce.number().int().nonnegative().default(10),
  restockDate: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Data de reposição inválida")
    .optional()
    .nullable(),
  price: z.coerce.number().nonnegative("Preço deve ser positivo"),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  popularity: z.coerce.number().int().nonnegative().default(0),
});

export const bulkUpdateItemSchema = z.object({
  id: z.string().min(1, "ID do produto é obrigatório"),
  stockQuantity: z.coerce.number().int().nonnegative().optional(),
  minStockThreshold: z.coerce.number().int().nonnegative().optional(),
});

export const bulkUpdateSchema = z.object({
  updates: z.array(bulkUpdateItemSchema).min(1, "Pelo menos uma atualização é necessária").max(100, "Máximo de 100 atualizações por vez"),
});

export const orderFeedbackSchema = z.object({
  rating: z.coerce.number().int().min(1, "Avaliação mínima é 1").max(5, "Avaliação máxima é 5"),
  comment: z.string().max(500, "Comentário deve ter no máximo 500 caracteres").optional().nullable(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type ProductSchema = z.infer<typeof productSchema>;
export type OrderFeedbackSchema = z.infer<typeof orderFeedbackSchema>;
