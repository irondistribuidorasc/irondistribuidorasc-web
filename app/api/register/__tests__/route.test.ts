import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies BEFORE importing the route
vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/src/lib/prisma", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
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

import { POST } from "../route";
import { db } from "@/src/lib/prisma";

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: unknown): Request {
    return new Request("http://localhost:3001/api/register", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3001",
      },
    });
  }

  it("returns 400 when body is invalid", async () => {
    const req = createRequest({ email: "invalid" });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBeTruthy();
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "existing-user",
      email: "test@test.com",
    } as unknown as Awaited<ReturnType<typeof db.user.findUnique>>);

    const req = createRequest({
      name: "Test User",
      email: "test@test.com",
      phone: "(48) 99999-9999",
      password: "StrongP@ss1",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.message).toContain("Já existe");
  });

  it("creates user successfully with valid data", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.create).mockResolvedValue({
      id: "new-user-1",
      name: "Test User",
      email: "test@test.com",
      phone: "(48) 99999-9999",
      docNumber: null,
    } as unknown as Awaited<ReturnType<typeof db.user.create>>);

    const req = createRequest({
      name: "Test User",
      email: "test@test.com",
      phone: "(48) 99999-9999",
      password: "StrongP@ss1",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("new-user-1");
    expect(json.email).toBe("test@test.com");
  });

  it("returns 400 when password is too weak", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const req = createRequest({
      name: "Test User",
      email: "test@test.com",
      password: "weak",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBeTruthy();
  });
});
