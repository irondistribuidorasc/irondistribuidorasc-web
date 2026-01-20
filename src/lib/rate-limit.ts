import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { redis, isRedisAvailable } from "./redis";

// Tipos de rate limiters disponíveis
type RateLimiterType = "auth" | "api" | "forgotPassword" | "sensitiveAction";

// Configurações de limite por tipo
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
    // Redis não disponível - permitir request (fail open)
    // Em produção, considere fail closed
    return null;
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
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

