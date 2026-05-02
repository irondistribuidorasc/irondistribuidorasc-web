export type AdminOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type AdminOrderInputItem = {
  productId: string;
  quantity: number;
  price?: number;
};

type AdminOrderProduct = {
  id: string;
  code: string;
  name: string;
  price: number;
  stockQuantity: number;
};

export type AdminOrderItemData = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

export type StockDeduction = {
  productId: string;
  productName?: string;
  quantity: number;
  currentStock: number;
};

type BuildAdminOrderItemsInput = {
  items: AdminOrderInputItem[];
  products: AdminOrderProduct[];
  shouldDeductStock: boolean;
};

type BuildAdminOrderItemsResult = {
  items: AdminOrderItemData[];
  stockDeductions: StockDeduction[];
  total: number;
};

const STOCK_DEDUCTING_STATUSES = new Set<AdminOrderStatus>([
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

export function shouldDeductStockForInitialStatus(
  status: AdminOrderStatus
): boolean {
  return STOCK_DEDUCTING_STATUSES.has(status);
}

export function shouldDeductStockForStatusTransition(
  previousStatus: AdminOrderStatus,
  nextStatus: AdminOrderStatus
): boolean {
  return (
    !shouldDeductStockForInitialStatus(previousStatus) &&
    shouldDeductStockForInitialStatus(nextStatus)
  );
}

export function shouldRestoreStockForStatusTransition(
  previousStatus: AdminOrderStatus,
  nextStatus: AdminOrderStatus
): boolean {
  return (
    shouldDeductStockForInitialStatus(previousStatus) &&
    nextStatus === "CANCELLED"
  );
}

export function buildAdminOrderItems({
  items,
  products,
  shouldDeductStock,
}: BuildAdminOrderItemsInput): BuildAdminOrderItemsResult {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const stockDeductions: StockDeduction[] = [];
  let total = 0;

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Produto não encontrado: ${item.productId}`);
    }

    if (shouldDeductStock) {
      validateStock(product, item.quantity);
      stockDeductions.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        currentStock: product.stockQuantity,
      });
    }

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    return {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
    };
  });

  return {
    items: orderItems,
    stockDeductions,
    total,
  };
}

function validateStock(product: AdminOrderProduct, quantity: number) {
  if (quantity > product.stockQuantity) {
    throw new Error(
      `Estoque insuficiente para ${product.name}. Disponível: ${product.stockQuantity}`
    );
  }
}

export function buildStockDeductionsForOrderItems({
  items,
  products,
}: Pick<BuildAdminOrderItemsInput, "items" | "products">): StockDeduction[] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Produto não encontrado: ${item.productId}`);
    }

    validateStock(product, item.quantity);

    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      currentStock: product.stockQuantity,
    };
  });
}

export function buildStockRestorationsForOrderItems({
  items,
  products,
}: Pick<BuildAdminOrderItemsInput, "items" | "products">): StockDeduction[] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Produto não encontrado: ${item.productId}`);
    }

    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      currentStock: product.stockQuantity,
    };
  });
}
