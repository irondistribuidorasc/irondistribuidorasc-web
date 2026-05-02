import type { NextConfig } from "next";

const securityHeaders = [
	// Previne clickjacking
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	// Previne MIME type sniffing
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	// Habilita proteção XSS do navegador
	{
		key: "X-XSS-Protection",
		value: "1; mode=block",
	},
	// Política de referrer
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	// Força HTTPS (apenas em produção)
	{
		key: "Strict-Transport-Security",
		value: "max-age=31536000; includeSubDomains",
	},
	// Controla recursos do navegador
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
	},
];

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.simpleicons.org",
			},
			{
				protocol: "https",
				hostname: "vvgxwlnxyhtxvariqnba.supabase.co",
			},
		],
	},
	async headers() {
		return [
			{
				// Aplicar headers de segurança em todas as rotas
				source: "/(.*)",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
