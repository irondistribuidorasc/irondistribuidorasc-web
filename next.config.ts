import type { NextConfig } from "next";

// Content Security Policy
// 'unsafe-eval' só é necessário em desenvolvimento para hot reload
// Em produção, removemos para maior segurança
const isDev = process.env.NODE_ENV === "development";
const scriptSrc = isDev
	? "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
	: "'self' 'unsafe-inline' https://va.vercel-scripts.com";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://vvgxwlnxyhtxvariqnba.supabase.co https://*.upstash.io https://va.vercel-scripts.com;
  frame-src 'self' https://www.google.com https://maps.google.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
`
	.replace(/\n/g, " ")
	.trim();

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
	// Content Security Policy
	{
		key: "Content-Security-Policy",
		value: ContentSecurityPolicy,
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
