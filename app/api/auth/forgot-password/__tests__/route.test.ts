import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/src/lib/prisma", () => ({
  db: {
    user: { findUnique: vi.fn() },
    passwordResetToken: { deleteMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/src/lib/rate-limit", () => ({
  getClientIP: () => "127.0.0.1",
  withRateLimit: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/src/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@/src/lib/password-reset-tokens", () => ({
  createPasswordResetToken: () => ({
    token: "raw-token-123",
    hashedToken: "hashed-token-123",
  }),
}));

const mockSendFn = vi.fn().mockResolvedValue({ error: null });
vi.mock("resend", () => ({
  Resend: function MockResend() {
    return { emails: { send: mockSendFn } };
  },
}));

import { POST } from "../route";
import { db } from "@/src/lib/prisma";

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendFn.mockReset();
    mockSendFn.mockResolvedValue({ error: null });
    vi.stubEnv("RESEND_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  function createRequest(body: unknown): Request {
    return new Request("http://localhost:3001/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3001",
      },
    });
  }

  it("returns 400 when email is invalid", async () => {
    const req = createRequest({ email: "invalid" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
  });

  it("returns 200 even when user does not exist (prevent enumeration)", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const req = createRequest({ email: "nonexistent@test.com" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("Se o e-mail existir");
  });

  it("creates reset token and sends email when user exists", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);
    vi.mocked(db.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(db.passwordResetToken.create).mockResolvedValue({
      id: "token-1",
      email: "test@test.com",
      tokenHash: "hashed-token-123",
      expires: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const req = createRequest({ email: "test@test.com" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(200);
    expect(db.passwordResetToken.deleteMany).toHaveBeenCalled();
    expect(db.passwordResetToken.create).toHaveBeenCalled();
    expect(mockSendFn).toHaveBeenCalled();
  });

  it("returns 200 mock when RESEND_API_KEY is not set in development", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "development");

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);
    vi.mocked(db.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(db.passwordResetToken.create).mockResolvedValue({
      id: "token-1",
      email: "test@test.com",
      tokenHash: "hashed-token-123",
      expires: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const req = createRequest({ email: "test@test.com" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("Mock");
  });
});
