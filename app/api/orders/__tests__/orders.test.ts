import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies BEFORE importing the route
vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/src/lib/prisma", () => ({
  db: {
    order: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/src/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { GET } from "../route";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

describe("GET /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Não autenticado");
  });

  it("returns orders for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: true,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const mockOrders = [
      {
        id: "order-1",
        orderNumber: "1001",
        status: "PENDING",
        total: 200,
        paymentMethod: "PIX",
        customerName: "Test User",
        customerEmail: "test@test.com",
        customerPhone: "(48) 99999-9999",
        addressLine1: "Rua Teste",
        city: "Itapema",
        state: "SC",
        postalCode: "88220-000",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            productCode: "P001",
            productName: "Produto Teste",
            quantity: 2,
            price: 100,
            total: 200,
          },
        ],
        feedback: null,
      },
    ];

    vi.mocked(db.order.findMany).mockResolvedValue(
      mockOrders as unknown as Awaited<ReturnType<typeof db.order.findMany>>
    );

    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].orderNumber).toBe("1001");
    expect(db.order.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: expect.objectContaining({
        id: true,
        orderNumber: true,
        status: true,
        items: expect.any(Object),
        feedback: expect.any(Object),
      }),
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns empty array when user has no orders", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: true,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    vi.mocked(db.order.findMany).mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: true,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    vi.mocked(db.order.findMany).mockRejectedValue(new Error("DB error"));

    const res = await GET();

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("Erro");
  });
});
