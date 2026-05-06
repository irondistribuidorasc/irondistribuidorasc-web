import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import proxy from "../../proxy";

describe("proxy public assets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getToken).mockResolvedValue(null);
  });

  it("deixa /logo-iron.webp passar sem redirecionar para login", async () => {
    const request = new NextRequest("http://localhost/logo-iron.webp");

    const response = await proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-security-policy")).toContain(
      "img-src 'self'",
    );
  });
});
