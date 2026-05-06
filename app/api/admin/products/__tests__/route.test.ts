import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/src/lib/csrf", () => ({
  validateCsrfOrigin: vi.fn(() => null),
}));

vi.mock("@/src/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/src/lib/prisma", () => ({
  db: {
    product: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { GET, POST } from "../route";

const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    approved: true,
  },
};

function createRequest(
  url: string,
  init?: { method?: string; body?: unknown },
): Request {
  return new Request(url, {
    method: init?.method ?? "GET",
    body: init?.body ? JSON.stringify(init.body) : undefined,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3001",
    },
  });
}

describe("app/api/admin/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia GET sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET(
      createRequest("http://localhost:3001/api/admin/products"),
    );

    expect(response.status).toBe(403);
  });

  it("lista produtos quando admin está autenticado", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(db.product.count).mockResolvedValue(1);
    vi.mocked(db.product.findMany).mockResolvedValue([
      {
        id: "prod-1",
        code: "P001",
        name: "Produto 1",
        brand: "Apple",
        category: "display",
        model: "iPhone 13",
        imageUrl: "/logo-iron.webp",
        inStock: true,
        stockQuantity: 10,
        minStockThreshold: 3,
        price: 120,
        description: "Descrição",
        tags: ["tag"],
        popularity: 10,
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
        updatedAt: new Date("2026-05-01T00:00:00.000Z"),
      },
    ] as never);

    const response = await GET(
      createRequest("http://localhost:3001/api/admin/products?page=1"),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.products).toHaveLength(1);
    expect(payload.pagination.total).toBe(1);
  });

  it("bloqueia POST sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await POST(
      createRequest("http://localhost:3001/api/admin/products", {
        method: "POST",
        body: {},
      }) as never,
    );

    expect(response.status).toBe(403);
  });

  it("cria produto quando admin envia payload válido", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(db.product.create).mockResolvedValue({
      id: "prod-1",
      code: "P001",
      name: "Produto 1",
      brand: "Apple",
      category: "display",
      model: "iPhone 13",
      imageUrl: "/logo-iron.webp",
      inStock: true,
      stockQuantity: 10,
      minStockThreshold: 3,
      price: 120,
      description: "Descrição",
      tags: ["tag"],
      popularity: 10,
      createdAt: new Date("2026-05-01T00:00:00.000Z"),
      updatedAt: new Date("2026-05-01T00:00:00.000Z"),
    } as never);

    const response = await POST(
      createRequest("http://localhost:3001/api/admin/products", {
        method: "POST",
        body: {
          code: "P001",
          name: "Produto 1",
          brand: "Apple",
          category: "display",
          model: "iPhone 13",
          imageUrl: "/logo-iron.webp",
          stockQuantity: 10,
          minStockThreshold: 3,
          price: 120,
          description: "Descrição",
          tags: ["tag"],
          popularity: 10,
        },
      }) as never,
    );

    expect(response.status).toBe(201);
    expect(db.product.create).toHaveBeenCalled();
  });
});
