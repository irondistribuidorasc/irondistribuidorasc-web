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
      findFirst: vi.fn(),
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

describe("app/api/admin/finance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia acesso sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost:3001/api/admin/finance") as never,
    );

    expect(response.status).toBe(403);
  });

  it("retorna resumo financeiro quando admin está autenticado", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(db.order.findMany).mockResolvedValue([
      {
        id: "order-1",
        orderNumber: "1001",
        customerName: "Maria",
        total: 200,
        paymentMethod: "PIX",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        status: "DELIVERED",
      },
      {
        id: "order-2",
        orderNumber: "1002",
        customerName: "João",
        total: 150,
        paymentMethod: "CASH",
        createdAt: new Date("2026-05-01T11:00:00.000Z"),
        status: "PENDING",
      },
    ] as never);

    const response = await GET(
      new Request("http://localhost:3001/api/admin/finance?date=2026-05-01") as never,
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.orders).toHaveLength(2);
    expect(payload.summary.total).toBe(200);
    expect(payload.summary.pix).toBe(200);
  });
});
