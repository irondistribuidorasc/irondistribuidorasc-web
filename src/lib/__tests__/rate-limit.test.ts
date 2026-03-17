import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("../redis", () => ({
  redis: null,
  isRedisAvailable: vi.fn(() => false),
}));

vi.mock("@/src/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("rate-limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkRateLimit", () => {
    it("retorna null quando Redis não está disponível", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("127.0.0.1", "auth");

      expect(result).toBeNull();
    });

    it("retorna null para tipo api quando Redis indisponível", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("127.0.0.1", "api");

      expect(result).toBeNull();
    });

    it("retorna null para tipo forgotPassword quando Redis indisponível", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("127.0.0.1", "forgotPassword");

      expect(result).toBeNull();
    });

    it("retorna null para tipo sensitiveAction quando Redis indisponível", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("127.0.0.1", "sensitiveAction");

      expect(result).toBeNull();
    });
  });

  describe("withRateLimit", () => {
    it("retorna null quando Redis não está disponível (fail open)", async () => {
      const { withRateLimit } = await import("../rate-limit");

      const result = await withRateLimit("127.0.0.1", "auth");

      expect(result).toBeNull();
    });

    it("permite request quando Redis indisponível para api", async () => {
      const { withRateLimit } = await import("../rate-limit");

      const result = await withRateLimit("192.168.1.1", "api");

      expect(result).toBeNull();
    });

    it("permite request quando Redis indisponível para forgotPassword", async () => {
      const { withRateLimit } = await import("../rate-limit");

      const result = await withRateLimit("10.0.0.1", "forgotPassword");

      expect(result).toBeNull();
    });

    it("permite request quando Redis indisponível para sensitiveAction", async () => {
      const { withRateLimit } = await import("../rate-limit");

      const result = await withRateLimit("172.16.0.1", "sensitiveAction");

      expect(result).toBeNull();
    });
  });

  describe("getClientIP", () => {
    it("extrai IP do header x-forwarded-for", async () => {
      const { getClientIP } = await import("../rate-limit");

      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      expect(getClientIP(request)).toBe("192.168.1.1");
    });

    it("extrai IP único do header x-forwarded-for", async () => {
      const { getClientIP } = await import("../rate-limit");

      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "203.0.113.50",
        },
      });

      expect(getClientIP(request)).toBe("203.0.113.50");
    });

    it("usa x-real-ip quando x-forwarded-for não existe", async () => {
      const { getClientIP } = await import("../rate-limit");

      const request = new Request("http://localhost", {
        headers: {
          "x-real-ip": "10.0.0.5",
        },
      });

      expect(getClientIP(request)).toBe("10.0.0.5");
    });

    it("retorna 'unknown' quando nenhum header de IP existe", async () => {
      const { getClientIP } = await import("../rate-limit");

      const request = new Request("http://localhost");

      expect(getClientIP(request)).toBe("unknown");
    });

    it("prioriza x-forwarded-for sobre x-real-ip", async () => {
      const { getClientIP } = await import("../rate-limit");

      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "1.2.3.4",
          "x-real-ip": "5.6.7.8",
        },
      });

      expect(getClientIP(request)).toBe("1.2.3.4");
    });

    it("trata espaços extras no x-forwarded-for", async () => {
      const { getClientIP } = await import("../rate-limit");

      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "  192.168.1.100  , 10.0.0.1",
        },
      });

      expect(getClientIP(request)).toBe("192.168.1.100");
    });
  });
});

describe("RateLimitResult interface", () => {
  it("tem os campos esperados", async () => {
    const { checkRateLimit } = await import("../rate-limit");

    // Quando Redis não está disponível, retorna null
    // Mas podemos verificar que a função existe e aceita os parâmetros corretos
    const result = await checkRateLimit("test-identifier", "auth");

    // Deve ser null porque Redis está mockado como indisponível
    expect(result).toBeNull();
  });
});

describe("RateLimitError", () => {
  it("é instância de Error com name correto", async () => {
    const { RateLimitError } = await import("../rate-limit");
    const error = new RateLimitError("test message");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RateLimitError");
    expect(error.message).toBe("test message");
  });
});

describe("Redis disponível mas com erro de rede", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.doMock("../redis", () => ({
      redis: { ping: vi.fn() },
      isRedisAvailable: vi.fn(() => true),
    }));

    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class MockRatelimit {
        limit = vi.fn().mockRejectedValue(new Error("Network error"));
        static slidingWindow = vi.fn().mockReturnValue("sliding-window");
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock("../redis");
    vi.doUnmock("@upstash/ratelimit");
    vi.restoreAllMocks();
  });

  it("tipo api (não-crítico) - retorna null (fail-open)", async () => {
    const { checkRateLimit } = await import("../rate-limit");

    const result = await checkRateLimit("192.168.1.1", "api");

    expect(result).toBeNull();
  });

  it("tipo auth (crítico) - retorna resultado in-memory (fail-closed)", async () => {
    const { checkRateLimit } = await import("../rate-limit");

    const result = await checkRateLimit("test@example.com", "auth");

    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.limit).toBe(5);
  });

  it("loga erro com mensagem e contexto corretos", async () => {
    const { logger } = await import("@/src/lib/logger");
    const { checkRateLimit } = await import("../rate-limit");

    await checkRateLimit("192.168.1.1", "api");

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao verificar rate limit no Redis"),
      expect.objectContaining({
        type: "api",
        identifier: "192.168.1.1",
        error: "Network error",
      })
    );
  });

  it("mascara email no log de erro de rede", async () => {
    const { logger } = await import("@/src/lib/logger");
    const { checkRateLimit } = await import("../rate-limit");

    await checkRateLimit("user@example.com", "auth");

    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ identifier: "us***@example.com" })
    );
  });
});

describe("produção com Redis indisponível", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("tipos críticos (fallback in-memory)", () => {
    it("auth - retorna resultado com success: true na primeira tentativa", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("test@example.com", "auth");

      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
      expect(result!.remaining).toBe(4);
      expect(result!.limit).toBe(5);
    });

    it("auth - bloqueia após exceder limite de 5 tentativas", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      for (let i = 0; i < 5; i++) {
        await checkRateLimit("brute@example.com", "auth");
      }

      const result = await checkRateLimit("brute@example.com", "auth");
      expect(result).not.toBeNull();
      expect(result!.success).toBe(false);
      expect(result!.remaining).toBe(0);
    });

    it("forgotPassword - retorna resultado com success: true (não null)", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("192.168.1.1", "forgotPassword");

      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
      expect(result!.limit).toBe(3);
    });

    it("forgotPassword - bloqueia após 3 tentativas", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      for (let i = 0; i < 3; i++) {
        await checkRateLimit("192.168.1.1", "forgotPassword");
      }

      const result = await checkRateLimit("192.168.1.1", "forgotPassword");
      expect(result!.success).toBe(false);
    });

    it("identifica diferentes usuários separadamente", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      for (let i = 0; i < 5; i++) {
        await checkRateLimit("a@example.com", "auth");
      }

      const result = await checkRateLimit("b@example.com", "auth");
      expect(result!.success).toBe(true);
      expect(result!.remaining).toBe(4);
    });
  });

  describe("tipos não-críticos (fail-open)", () => {
    it("api - retorna null", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("192.168.1.1", "api");
      expect(result).toBeNull();
    });

    it("sensitiveAction - retorna null", async () => {
      const { checkRateLimit } = await import("../rate-limit");

      const result = await checkRateLimit("192.168.1.1", "sensitiveAction");
      expect(result).toBeNull();
    });
  });

  describe("logging", () => {
    it("usa logger.error para tipos críticos", async () => {
      const { logger } = await import("@/src/lib/logger");
      const { checkRateLimit } = await import("../rate-limit");

      await checkRateLimit("test@example.com", "auth");

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("fail-closed"),
        expect.objectContaining({ type: "auth" })
      );
    });

    it("usa logger.warn para tipos não-críticos", async () => {
      const { logger } = await import("@/src/lib/logger");
      const { checkRateLimit } = await import("../rate-limit");

      await checkRateLimit("192.168.1.1", "api");

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("fail-open"),
        expect.objectContaining({ type: "api" })
      );
    });

    it("mascara email no log (PII)", async () => {
      const { logger } = await import("@/src/lib/logger");
      const { checkRateLimit } = await import("../rate-limit");

      await checkRateLimit("usuario@example.com", "auth");

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ identifier: "us***@example.com" })
      );
    });

    it("não mascara IP no log", async () => {
      const { logger } = await import("@/src/lib/logger");
      const { checkRateLimit } = await import("../rate-limit");

      await checkRateLimit("192.168.1.1", "api");

      expect(logger.warn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ identifier: "192.168.1.1" })
      );
    });
  });

  describe("withRateLimit para tipos críticos", () => {
    it("retorna null quando dentro do limite", async () => {
      const { withRateLimit } = await import("../rate-limit");

      const result = await withRateLimit("192.168.1.1", "auth");
      expect(result).toBeNull();
    });

    it("retorna 429 quando limite excedido", async () => {
      const { withRateLimit, checkRateLimit } = await import("../rate-limit");

      for (let i = 0; i < 5; i++) {
        await checkRateLimit("192.168.1.1", "auth");
      }

      const result = await withRateLimit("192.168.1.1", "auth");
      expect(result).not.toBeNull();
      expect(result!.status).toBe(429);
    });
  });
});
