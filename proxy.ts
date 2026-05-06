import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildContentSecurityPolicy,
  CONTENT_SECURITY_POLICY_HEADER,
  createCspNonce,
  NONCE_HEADER,
} from "./src/lib/csp";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/produtos",
  "/garantia",
  "/recuperar-senha",
  "/redefinir-senha",
  "/conta-pendente",
  "/termos-de-uso",
  "/politica-de-privacidade",
  "/politica-de-trocas",
];

const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/register",
  "/_next",
  "/favicon.ico",
  "/logo-iron.png",
  "/logo-iron.webp",
  "/favicons/",
  "/brands/",
];

export default async function proxy(request: NextRequest) {
  const nonce = createCspNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy({
    isDev: process.env.NODE_ENV === "development",
    nonce,
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(CONTENT_SECURITY_POLICY_HEADER, contentSecurityPolicy);

  const response = await buildAccessResponse(request, requestHeaders);
  response.headers.set(CONTENT_SECURITY_POLICY_HEADER, contentSecurityPolicy);

  return response;
}

async function buildAccessResponse(
  request: NextRequest,
  requestHeaders: Headers
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    (path.startsWith("/checkout") || path.startsWith("/carrinho/checkout")) &&
    token?.approved === false
  ) {
    return NextResponse.redirect(new URL("/conta-pendente", request.url));
  }

  if (isPublicPath(path) || token) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", path);
  return NextResponse.redirect(loginUrl);
}

function isPublicPath(path: string) {
  if (path === "/carrinho") {
    return true;
  }

  if (PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return true;
  }

  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath === "/") {
      return path === "/";
    }

    return path.startsWith(publicPath);
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
