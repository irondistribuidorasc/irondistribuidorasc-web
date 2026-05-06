import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
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
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { GET } from "../route";

const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    approved: true,
  },
};

function createNextRequest(url: string) {
  return {
    url,
    nextUrl: new URL(url),
  } as never;
}

describe("app/api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia acesso sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET(
      createNextRequest("http://localhost:3001/api/admin/orders"),
    );

    expect(response.status).toBe(401);
  });

  it("lista pedidos quando admin está autenticado", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(db.order.count).mockResolvedValue(1);
    vi.mocked(db.order.findMany).mockResolvedValue([
      {
        id: "order-1",
        orderNumber: "1001",
        status: "PENDING",
        total: 200,
        paymentMethod: "PIX",
        customerName: "Maria",
        customerEmail: "maria@example.com",
        customerPhone: "47999999999",
        addressLine1: "Rua 1",
        city: "Itapema",
        state: "SC",
        postalCode: "88220-000",
        notes: null,
        whatsappMessageSent: false,
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        updatedAt: new Date("2026-05-01T10:00:00.000Z"),
        items: [],
        user: {
          id: "user-1",
          name: "Maria",
          email: "maria@example.com",
        },
      },
    ] as never);

    const response = await GET(
      createNextRequest("http://localhost:3001/api/admin/orders"),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.orders).toHaveLength(1);
    expect(payload.pagination.total).toBe(1);
  });
});
