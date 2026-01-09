import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock do redis - sempre indisponível para testes básicos
vi.mock("../redis", () => ({
  redis: null,
  isRedisAvailable: vi.fn(() => false),
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
