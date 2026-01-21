import type { OrderFeedback } from "./feedback";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocNumber?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  notes?: string | null;
  whatsappMessageSent: boolean;
  items: OrderItem[];
  feedback?: OrderFeedback | null;
  createdAt: string;
  updatedAt: string;
}
