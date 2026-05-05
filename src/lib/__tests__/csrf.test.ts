import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { validateCsrfOrigin } from "../csrf";
import type { NextRequest } from "next/server";

function mockRequest(origin?: string, referer?: string): NextRequest {
  const headers = new Map<string, string>();
  if (origin) headers.set("origin", origin);
  if (referer) headers.set("referer", referer);
  return {
    headers: {
      get: (key: string) => headers.get(key) ?? null,
    },
  } as unknown as NextRequest;
}

describe("validateCsrfOrigin", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 403 when no origin or referer", () => {
    const result = validateCsrfOrigin(mockRequest());
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it("returns null for valid production origin", () => {
    const result = validateCsrfOrigin(
      mockRequest("https://irondistribuidorasc.com.br")
    );
    expect(result).toBeNull();
  });

  it("returns null for valid www origin", () => {
    const result = validateCsrfOrigin(
      mockRequest("https://www.irondistribuidorasc.com.br")
    );
    expect(result).toBeNull();
  });

  it("returns 403 for disallowed origin", () => {
    const result = validateCsrfOrigin(
      mockRequest("https://evil.com")
    );
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it("returns null for localhost in development", () => {
    process.env.NODE_ENV = "development";
    const result = validateCsrfOrigin(
      mockRequest("http://localhost:3001")
    );
    expect(result).toBeNull();
  });

  it("returns 403 for localhost in production", () => {
    process.env.NODE_ENV = "production";
    const result = validateCsrfOrigin(
      mockRequest("http://localhost:3001")
    );
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it("uses ALLOWED_ORIGINS env when set", () => {
    process.env.ALLOWED_ORIGINS = "https://custom.com,https://other.com";
    const result = validateCsrfOrigin(
      mockRequest("https://custom.com")
    );
    expect(result).toBeNull();
  });

  it("rejects origin not in ALLOWED_ORIGINS", () => {
    process.env.ALLOWED_ORIGINS = "https://custom.com";
    const result = validateCsrfOrigin(
      mockRequest("https://irondistribuidorasc.com.br")
    );
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it("uses referer as fallback when origin is missing", () => {
    const result = validateCsrfOrigin(
      mockRequest(undefined, "https://irondistribuidorasc.com.br/page")
    );
    expect(result).toBeNull();
  });
});
