import { vi } from "vitest";

// Helper to create a mock NextRequest
type RequestInit = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

export function createMockRequest(
  url: string,
  init?: RequestInit
): Request {
  return new Request(url, {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

// Mock session types
export type MockSession = {
  user: {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
    approved: boolean;
    name?: string;
  };
} | null;

// Setup auth mock
export function mockAuth(session: MockSession) {
  vi.doMock("@/src/lib/auth", () => ({
    auth: () => Promise.resolve(session),
  }));
}

// Setup prisma mock
export function mockPrisma(mockDb: Record<string, unknown>) {
  vi.doMock("@/src/lib/prisma", () => ({
    db: mockDb,
  }));
}

// Setup rate-limit mock (pass-through)
export function mockRateLimit() {
  vi.doMock("@/src/lib/rate-limit", () => ({
    getClientIP: () => "127.0.0.1",
    withRateLimit: () => Promise.resolve(null),
  }));
}

// Setup CSRF mock (pass-through)
export function mockCsrf() {
  vi.doMock("@/src/lib/csrf", () => ({
    validateCsrfOrigin: () => null,
  }));
}
