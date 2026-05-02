import { describe, expect, it } from "vitest";
import {
  buildStockRestorationsForOrderItems,
  buildStockDeductionsForOrderItems,
  buildAdminOrderItems,
  shouldDeductStockForInitialStatus,
  shouldDeductStockForStatusTransition,
  shouldRestoreStockForStatusTransition,
} from "@/src/lib/admin-order-items";

const products = [
  {
    id: "product-1",
    code: "DISP-SAM-A02",
    name: "Display Samsung A02",
    price: 89.9,
    stockQuantity: 3,
  },
  {
    id: "product-2",
    code: "BAT-SAM-A02",
    name: "Bateria Samsung A02",
    price: 45,
    stockQuantity: 10,
  },
];

describe("shouldDeductStockForInitialStatus", () => {
  it("deducts stock only for active initial statuses", () => {
    expect(shouldDeductStockForInitialStatus("PENDING")).toBe(false);
    expect(shouldDeductStockForInitialStatus("CANCELLED")).toBe(false);
    expect(shouldDeductStockForInitialStatus("CONFIRMED")).toBe(true);
    expect(shouldDeductStockForInitialStatus("PROCESSING")).toBe(true);
    expect(shouldDeductStockForInitialStatus("SHIPPED")).toBe(true);
    expect(shouldDeductStockForInitialStatus("DELIVERED")).toBe(true);
  });
});

describe("shouldDeductStockForStatusTransition", () => {
  it("deducts only when moving from non-deducting to deducting status", () => {
    expect(shouldDeductStockForStatusTransition("PENDING", "CONFIRMED")).toBe(
      true
    );
    expect(shouldDeductStockForStatusTransition("PENDING", "PROCESSING")).toBe(
      true
    );
    expect(shouldDeductStockForStatusTransition("CONFIRMED", "PROCESSING")).toBe(
      false
    );
    expect(shouldDeductStockForStatusTransition("DELIVERED", "CANCELLED")).toBe(
      false
    );
    expect(shouldDeductStockForStatusTransition("PENDING", "CANCELLED")).toBe(
      false
    );
  });
});

describe("shouldRestoreStockForStatusTransition", () => {
  it("restores only when moving from stock-deducting status to cancelled", () => {
    expect(shouldRestoreStockForStatusTransition("PENDING", "CANCELLED")).toBe(
      false
    );
    expect(
      shouldRestoreStockForStatusTransition("CONFIRMED", "CANCELLED")
    ).toBe(true);
    expect(
      shouldRestoreStockForStatusTransition("PROCESSING", "CANCELLED")
    ).toBe(true);
    expect(shouldRestoreStockForStatusTransition("SHIPPED", "CANCELLED")).toBe(
      true
    );
    expect(
      shouldRestoreStockForStatusTransition("DELIVERED", "CANCELLED")
    ).toBe(true);
    expect(shouldRestoreStockForStatusTransition("CONFIRMED", "SHIPPED")).toBe(
      false
    );
    expect(shouldRestoreStockForStatusTransition("CANCELLED", "CANCELLED")).toBe(
      false
    );
  });
});

describe("buildAdminOrderItems", () => {
  it("uses official database price instead of client supplied price", () => {
    const result = buildAdminOrderItems({
      items: [{ productId: "product-1", quantity: 2, price: 1 }],
      products,
      shouldDeductStock: true,
    });

    expect(result.total).toBe(179.8);
    expect(result.items).toEqual([
      {
        productId: "product-1",
        productCode: "DISP-SAM-A02",
        productName: "Display Samsung A02",
        quantity: 2,
        price: 89.9,
        total: 179.8,
      },
    ]);
  });

  it("returns stock deductions for active orders", () => {
    const result = buildAdminOrderItems({
      items: [{ productId: "product-1", quantity: 2 }],
      products,
      shouldDeductStock: true,
    });

    expect(result.stockDeductions).toEqual([
      {
        productId: "product-1",
        productName: "Display Samsung A02",
        quantity: 2,
        currentStock: 3,
      },
    ]);
  });

  it("does not validate or deduct stock for pending orders", () => {
    const result = buildAdminOrderItems({
      items: [{ productId: "product-1", quantity: 99 }],
      products,
      shouldDeductStock: false,
    });

    expect(result.stockDeductions).toEqual([]);
    expect(result.total).toBeCloseTo(89.9 * 99);
  });

  it("fails when product is missing", () => {
    expect(() =>
      buildAdminOrderItems({
        items: [{ productId: "missing", quantity: 1 }],
        products,
        shouldDeductStock: true,
      })
    ).toThrow("Produto não encontrado");
  });

  it("fails when active order exceeds available stock", () => {
    expect(() =>
      buildAdminOrderItems({
        items: [{ productId: "product-1", quantity: 4 }],
        products,
        shouldDeductStock: true,
      })
    ).toThrow("Estoque insuficiente");
  });
});

describe("buildStockDeductionsForOrderItems", () => {
  it("builds validated stock deductions for existing products", () => {
    expect(
      buildStockDeductionsForOrderItems({
        items: [{ productId: "product-2", quantity: 5 }],
        products,
      })
    ).toEqual([
      {
        productId: "product-2",
        productName: "Bateria Samsung A02",
        quantity: 5,
        currentStock: 10,
      },
    ]);
  });

  it("fails when stock is insufficient", () => {
    expect(() =>
      buildStockDeductionsForOrderItems({
        items: [{ productId: "product-1", quantity: 4 }],
        products,
      })
    ).toThrow("Estoque insuficiente");
  });
});

describe("buildStockRestorationsForOrderItems", () => {
  it("builds stock restorations for existing products without stock validation", () => {
    expect(
      buildStockRestorationsForOrderItems({
        items: [{ productId: "product-1", quantity: 4 }],
        products,
      })
    ).toEqual([
      {
        productId: "product-1",
        productName: "Display Samsung A02",
        quantity: 4,
        currentStock: 3,
      },
    ]);
  });

  it("fails when product is missing", () => {
    expect(() =>
      buildStockRestorationsForOrderItems({
        items: [{ productId: "missing", quantity: 1 }],
        products,
      })
    ).toThrow("Produto não encontrado");
  });
});
