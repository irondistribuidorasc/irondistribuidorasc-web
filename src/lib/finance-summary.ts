import type { OrderStatus } from "@/types/order";

export const FINANCIAL_ORDER_STATUSES = ["DELIVERED"] as const;

type FinancialPaymentMethod =
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "OTHER"
  | string;

type FinancialOrder = {
  total: number;
  paymentMethod: FinancialPaymentMethod;
  status: OrderStatus | string;
};

export type FinancialSummary = {
  total: number;
  pix: number;
  creditCard: number;
  debitCard: number;
  cash: number;
  other: number;
};

export function isFinanciallyEligibleStatus(status: string): boolean {
  return FINANCIAL_ORDER_STATUSES.includes(
    status as (typeof FINANCIAL_ORDER_STATUSES)[number]
  );
}

export function buildFinancialSummary(
  orders: FinancialOrder[]
): FinancialSummary {
  return orders.reduce<FinancialSummary>(
    (summary, order) => {
      if (!isFinanciallyEligibleStatus(order.status)) {
        return summary;
      }

      summary.total += order.total;

      switch (order.paymentMethod) {
        case "PIX":
          summary.pix += order.total;
          break;
        case "CREDIT_CARD":
          summary.creditCard += order.total;
          break;
        case "DEBIT_CARD":
          summary.debitCard += order.total;
          break;
        case "CASH":
          summary.cash += order.total;
          break;
        default:
          summary.other += order.total;
      }

      return summary;
    },
    {
      total: 0,
      pix: 0,
      creditCard: 0,
      debitCard: 0,
      cash: 0,
      other: 0,
    }
  );
}
