import { describe, expect, it } from "vitest";
import {
  buildFinancialSummary,
  FINANCIAL_ORDER_STATUSES,
  isFinanciallyEligibleStatus,
} from "@/src/lib/finance-summary";

const baseOrder = {
  total: 100,
  paymentMethod: "PIX",
};

describe("isFinanciallyEligibleStatus", () => {
  it("allows confirmed, processing, shipped and delivered orders into financial summary", () => {
    expect(FINANCIAL_ORDER_STATUSES).toEqual([
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ]);
    expect(isFinanciallyEligibleStatus("CONFIRMED")).toBe(true);
    expect(isFinanciallyEligibleStatus("PROCESSING")).toBe(true);
    expect(isFinanciallyEligibleStatus("SHIPPED")).toBe(true);
    expect(isFinanciallyEligibleStatus("DELIVERED")).toBe(true);
    expect(isFinanciallyEligibleStatus("PENDING")).toBe(false);
    expect(isFinanciallyEligibleStatus("CANCELLED")).toBe(false);
  });
});

describe("buildFinancialSummary", () => {
  it("sums confirmed, processing, shipped and delivered orders by payment method", () => {
    const summary = buildFinancialSummary([
      { ...baseOrder, status: "DELIVERED", paymentMethod: "PIX", total: 100 },
      {
        ...baseOrder,
        status: "CONFIRMED",
        paymentMethod: "CREDIT_CARD",
        total: 200,
      },
      { ...baseOrder, status: "PROCESSING", paymentMethod: "DEBIT_CARD", total: 30 },
      { ...baseOrder, status: "SHIPPED", paymentMethod: "CASH", total: 40 },
      { ...baseOrder, status: "DELIVERED", paymentMethod: "OTHER", total: 50 },
      { ...baseOrder, status: "PENDING", paymentMethod: "PIX", total: 999 },
      { ...baseOrder, status: "CANCELLED", paymentMethod: "PIX", total: 999 },
    ]);

    expect(summary).toEqual({
      total: 420,
      pix: 100,
      creditCard: 200,
      debitCard: 30,
      cash: 40,
      other: 50,
    });
  });

  it("puts unknown payment methods into other", () => {
    const summary = buildFinancialSummary([
      { ...baseOrder, status: "CONFIRMED", paymentMethod: "BOLETO", total: 75 },
    ]);

    expect(summary.other).toBe(75);
    expect(summary.total).toBe(75);
  });
});
