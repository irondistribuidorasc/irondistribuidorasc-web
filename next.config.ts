import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

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
		formats: ["image/avif", "image/webp"],
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

export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
})(nextConfig);
