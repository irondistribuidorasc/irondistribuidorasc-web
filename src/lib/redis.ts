import { Redis } from "@upstash/redis";

// Verificar se as variáveis de ambiente estão configuradas
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Criar cliente Redis apenas se as credenciais existirem
// Em desenvolvimento, pode funcionar sem Redis (rate limiting desabilitado)
export const redis =
	upstashUrl && upstashToken
		? new Redis({
				url: upstashUrl,
				token: upstashToken,
			})
		: null;

// Helper para verificar se Redis está disponível
export const isRedisAvailable = (): boolean => redis !== null;
