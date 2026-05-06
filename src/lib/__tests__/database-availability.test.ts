import { afterEach, describe, expect, it, vi } from "vitest";

import { canReachDatabase } from "../database-availability";

describe("database availability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("retorna false quando DATABASE_URL não existe", async () => {
    vi.stubEnv("DATABASE_URL", "");

    await expect(canReachDatabase()).resolves.toBe(false);
  });

  it("retorna false quando a URL é inválida", async () => {
    await expect(canReachDatabase("not-a-valid-url")).resolves.toBe(false);
  });

  it("retorna false quando o banco não responde", async () => {
    await expect(
      canReachDatabase("postgresql://user:pass@127.0.0.1:1/db")
    ).resolves.toBe(false);
  });
});
