import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { logger } from "@/src/lib/logger";
import { isRedisAvailable, redis } from "./redis";

type RateLimiterType = "auth" | "api" | "forgotPassword" | "sensitiveAction";

/** Erro lançado quando o rate limit é excedido */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

const CRITICAL_TYPES: ReadonlySet<RateLimiterType> = new Set(["auth", "forgotPassword"]);

const RATE_LIMIT_CONFIG: Record<
  RateLimiterType,
  { requests: number; window: `${number} ${"s" | "m" | "h" | "d"}` }
> = {
  auth: { requests: 5, window: "1 m" }, // 5 tentativas por minuto (login/register)
  api: { requests: 100, window: "1 m" }, // 100 requests por minuto (APIs gerais)
  forgotPassword: { requests: 3, window: "1 h" }, // 3 requests por hora
  sensitiveAction: { requests: 10, window: "1 h" }, // 10 ações sensíveis por hora
};

// Cache de rate limiters
const rateLimiters: Partial<Record<RateLimiterType, Ratelimit>> = {};

/**
 * Obtém ou cria um rate limiter para o tipo especificado
 */
function getRateLimiter(type: RateLimiterType): Ratelimit | null {
  if (!isRedisAvailable() || !redis) {
    return null;
  }

  if (!rateLimiters[type]) {
    const config = RATE_LIMIT_CONFIG[type];
    rateLimiters[type] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:${type}`,
    });
  }

  return rateLimiters[type]!;
}

function maskIdentifier(id: string): string {
  if (id.includes("@")) {
    return id.replace(/(.{2}).*(@.*)/, "$1***$2");
  }
  return id;
}

function parseWindow(window: string): number {
  const [amount, unit] = window.split(" ");
  const value = parseInt(amount, 10);
  const multipliers: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (multipliers[unit] ?? 60_000);
}

// Fallback in-memory para quando Redis está indisponível.
// Em ambientes serverless (Vercel Functions, Lambda), cada cold start
// cria um Map independente — o rate limiting é por-instância, não global.
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();
const IN_MEMORY_CLEANUP_INTERVAL = 5 * 60_000;
const MAX_IN_MEMORY_ENTRIES = 10_000;
let lastCleanup = Date.now();

function cleanupInMemoryStore(): void {
  const now = Date.now();
  if (now - lastCleanup < IN_MEMORY_CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of inMemoryStore) {
    if (now > entry.resetAt) {
      inMemoryStore.delete(key);
    }
  }
}

function inMemoryRateLimit(identifier: string, type: RateLimiterType): RateLimitResult {
  cleanupInMemoryStore();
  const config = RATE_LIMIT_CONFIG[type];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  const windowMs = parseWindow(config.window);
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    if (inMemoryStore.size >= MAX_IN_MEMORY_ENTRIES) {
      cleanupInMemoryStore();
      if (inMemoryStore.size >= MAX_IN_MEMORY_ENTRIES) {
        return { success: false, limit: config.requests, remaining: 0, reset: now + windowMs };
      }
    }
    const resetAt = now + windowMs;
    inMemoryStore.set(key, { count: 1, resetAt });
    return { success: true, limit: config.requests, remaining: config.requests - 1, reset: resetAt };
  }

  entry.count++;
  if (entry.count > config.requests) {
    return { success: false, limit: config.requests, remaining: 0, reset: entry.resetAt };
  }

  return { success: true, limit: config.requests, remaining: config.requests - entry.count, reset: entry.resetAt };
}

/**
 * Resultado do check de rate limit
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Verifica rate limit para um identificador (IP, email, etc)
 * @param identifier - Identificador único (IP, email, userId)
 * @param type - Tipo de rate limiter a usar
 * @returns Resultado do rate limit ou null se Redis não disponível
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimiterType
): Promise<RateLimitResult | null> {
  const limiter = getRateLimiter(type);

  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      const masked = maskIdentifier(identifier);
      if (CRITICAL_TYPES.has(type)) {
        logger.error("rate-limit - Redis indisponível em produção, usando fallback in-memory (fail-closed)", { type, identifier: masked });
        return inMemoryRateLimit(identifier, type);
      }
      logger.warn("rate-limit - Redis indisponível em produção, permitindo request (fail-open)", { type, identifier: masked });
    }
    return null;
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    const masked = maskIdentifier(identifier);
    logger.error("rate-limit - Erro ao verificar rate limit no Redis", {
      type,
      identifier: masked,
      error: error instanceof Error ? error.message : String(error),
    });

    if (CRITICAL_TYPES.has(type)) {
      return inMemoryRateLimit(identifier, type);
    }

    return null;
  }
}

/**
 * Middleware helper para aplicar rate limiting em API routes
 * Retorna NextResponse de erro se limite excedido, null caso contrário
 */
export async function withRateLimit(
  identifier: string,
  type: RateLimiterType
): Promise<NextResponse | null> {
  const result = await checkRateLimit(identifier, type);

  // Se Redis não está disponível, permitir request
  if (!result) {
    return null;
  }

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: "Muitas tentativas. Tente novamente mais tarde.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Extrai IP do request para usar como identificador
 */
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}

