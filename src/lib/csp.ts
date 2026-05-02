export const CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy";
export const NONCE_HEADER = "x-nonce";

type BuildContentSecurityPolicyInput = {
  isDev: boolean;
  nonce: string;
};

export function createCspNonce() {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function buildContentSecurityPolicy({
  isDev,
  nonce,
}: BuildContentSecurityPolicyInput) {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://va.vercel-scripts.com",
    isDev ? "'unsafe-eval'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
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
    .replace(/\s{2,}/g, " ")
    .trim();
}
