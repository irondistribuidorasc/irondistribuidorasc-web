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
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { GET, PATCH } from "../route";

const adminSession = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    approved: true,
  },
};

function createRequest(body?: unknown): Request {
  return new Request("http://localhost:3001/api/admin/users", {
    method: body ? "PATCH" : "GET",
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3001",
    },
  });
}

describe("app/api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia GET sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost:3001/api/admin/users") as never,
    );

    expect(response.status).toBe(403);
  });

  it("lista usuários quando admin está autenticado", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(db.user.count).mockResolvedValue(1);
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "user-1",
        name: "Maria",
        email: "maria@example.com",
        phone: "47999999999",
        docNumber: "12345678901",
        storeName: "Loja Maria",
        role: "USER",
        approved: false,
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
      },
    ] as never);

    const response = await GET(
      new Request("http://localhost:3001/api/admin/users") as never,
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.users).toHaveLength(1);
    expect(payload.pagination.total).toBe(1);
  });

  it("bloqueia PATCH sem sessão admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await PATCH(
      createRequest({ userId: "user-1", approved: true }) as never,
    );

    expect(response.status).toBe(403);
  });

  it("atualiza aprovação e cria notificação quando admin envia payload válido", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(db.user.update).mockResolvedValue({
      id: "user-1",
      name: "Maria",
      email: "maria@example.com",
      approved: true,
    } as never);

    const response = await PATCH(
      createRequest({ userId: "user-1", approved: true }) as never,
    );

    expect(response.status).toBe(200);
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { approved: true },
      }),
    );
    expect(db.notification.create).toHaveBeenCalled();
  });
});
