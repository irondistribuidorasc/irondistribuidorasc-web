import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies BEFORE importing the route
vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/src/lib/prisma", () => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
    order: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/src/lib/rate-limit", () => ({
  getClientIP: () => "127.0.0.1",
  withRateLimit: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/src/lib/csrf", () => ({
  validateCsrfOrigin: vi.fn(() => null),
}));

vi.mock("@/src/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { POST } from "../route";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";

describe("POST /api/orders/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: unknown): Request {
    return new Request("http://localhost:3001/api/orders/create", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3001",
      },
    });
  }

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = createRequest({});
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Não autenticado");
  });

  it("returns 403 when user is not approved", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: false,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const req = createRequest({});
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Usuário não aprovado");
  });

  it("returns 400 when body is invalid", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: true,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    const req = createRequest({ items: [] });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("returns 400 when stock is insufficient", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: true,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    vi.mocked(db.product.findMany).mockResolvedValue([
      {
        id: "prod-1",
        price: 100,
        name: "Produto Teste",
        code: "P001",
        stockQuantity: 5,
      },
    ] as unknown as Awaited<ReturnType<typeof db.product.findMany>>);

    const req = createRequest({
      items: [
        {
          productId: "prod-1",
          productCode: "P001",
          productName: "Produto Teste",
          quantity: 10,
          price: 100,
        },
      ],
      customer: {
        name: "Teste",
        email: "test@test.com",
        phone: "(48) 99999-9999",
        addressLine1: "Rua Teste",
        city: "Itapema",
        state: "SC",
        postalCode: "88220-000",
      },
      paymentMethod: "PIX",
    });

    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Estoque insuficiente");
    expect(json.details).toBeDefined();
  });

  it("creates order successfully with valid data", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@test.com",
        role: "USER",
        approved: true,
      },
    } as unknown as Awaited<ReturnType<typeof auth>>);

    vi.mocked(db.product.findMany).mockResolvedValue([
      {
        id: "prod-1",
        price: 100,
        name: "Produto Teste",
        code: "P001",
        stockQuantity: 50,
      },
    ] as unknown as Awaited<ReturnType<typeof db.product.findMany>>);

    vi.mocked(db.order.findFirst).mockResolvedValue(null);
    vi.mocked(db.order.create).mockResolvedValue({
      id: "order-1",
      orderNumber: "1001",
      status: "PENDING",
      total: 200,
      items: [
        {
          productId: "prod-1",
          productCode: "P001",
          productName: "Produto Teste",
          quantity: 2,
          price: 100,
          total: 200,
        },
      ],
    } as unknown as Awaited<ReturnType<typeof db.order.create>>);

    const req = createRequest({
      items: [
        {
          productId: "prod-1",
          productCode: "P001",
          productName: "Produto Teste",
          quantity: 2,
          price: 100,
        },
      ],
      customer: {
        name: "Teste",
        email: "test@test.com",
        phone: "(48) 99999-9999",
        addressLine1: "Rua Teste",
        city: "Itapema",
        state: "SC",
        postalCode: "88220-000",
      },
      paymentMethod: "PIX",
    });

    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.orderNumber).toBe("1001");
    expect(json.total).toBe(200);
  });
});
