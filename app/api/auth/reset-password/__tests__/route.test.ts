import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies BEFORE importing the route
vi.mock("@/src/lib/prisma", () => ({
  db: {
    user: {
      update: vi.fn(),
    },
    passwordResetToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/src/lib/rate-limit", () => ({
  getClientIP: () => "127.0.0.1",
  withRateLimit: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/src/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/src/lib/password-reset-tokens", () => ({
  hashPasswordResetToken: (token: string) => `hashed-${token}`,
}));

vi.mock("bcrypt", () => ({
  hash: vi.fn().mockResolvedValue("hashed-password"),
}));

import { POST } from "../route";
import { db } from "@/src/lib/prisma";

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: unknown): Request {
    return new Request("http://localhost:3001/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3001",
      },
    });
  }

  it("returns 400 when token or password is missing", async () => {
    const req = createRequest({ token: "some-token" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("obrigatórios");
  });

  it("returns 400 when password is too weak", async () => {
    const req = createRequest({ token: "some-token", newPassword: "weak" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBeTruthy();
  });

  it("returns 400 when token is invalid", async () => {
    vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(null);

    const req = createRequest({
      token: "invalid-token",
      newPassword: "StrongP@ss1",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("inválido");
  });

  it("returns 400 and deletes token when token is expired", async () => {
    vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue({
      id: "token-1",
      email: "test@test.com",
      tokenHash: "hashed-some-token",
      expires: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date(),
    });

    const req = createRequest({
      token: "some-token",
      newPassword: "StrongP@ss1",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("expirado");
    expect(db.passwordResetToken.delete).toHaveBeenCalled();
  });

  it("resets password successfully with valid token", async () => {
    vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue({
      id: "token-1",
      email: "test@test.com",
      tokenHash: "hashed-some-token",
      expires: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
    });
    vi.mocked(db.user.update).mockResolvedValue({
      id: "user-1",
    } as unknown as Awaited<ReturnType<typeof db.user.update>>);
    vi.mocked(db.passwordResetToken.delete).mockResolvedValue({
      id: "token-1",
      email: "test@test.com",
      tokenHash: "hashed-some-token",
      expires: new Date(),
      createdAt: new Date(),
    });

    const req = createRequest({
      token: "some-token",
      newPassword: "StrongP@ss1",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("sucesso");
    expect(db.user.update).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
      data: { hashedPassword: "hashed-password" },
    });
    expect(db.passwordResetToken.delete).toHaveBeenCalled();
  });
});
