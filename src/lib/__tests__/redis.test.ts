import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("redis", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("redis é null quando variáveis de ambiente não estão configuradas", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { redis, isRedisAvailable } = await import("../redis");

    expect(redis).toBeNull();
    expect(isRedisAvailable()).toBe(false);
  });

  it("redis é null quando apenas URL está configurada", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { redis, isRedisAvailable } = await import("../redis");

    expect(redis).toBeNull();
    expect(isRedisAvailable()).toBe(false);
  });

  it("redis é null quando apenas token está configurado", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { redis, isRedisAvailable } = await import("../redis");

    expect(redis).toBeNull();
    expect(isRedisAvailable()).toBe(false);
  });

  it("isRedisAvailable retorna true quando redis está configurado", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { redis, isRedisAvailable } = await import("../redis");

    expect(redis).not.toBeNull();
    expect(isRedisAvailable()).toBe(true);
  });
});

