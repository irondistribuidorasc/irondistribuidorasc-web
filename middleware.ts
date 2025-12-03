import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Proteger rotas admin
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Proteger rotas de checkout
    if (path.startsWith("/checkout") || path.startsWith("/carrinho/checkout")) {
      if (token?.approved === false) {
        return NextResponse.redirect(new URL("/conta-pendente", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public paths that don't require authentication
        const publicPaths = [
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

        // /carrinho is public, but /carrinho/checkout is private (handled by startsWith check below if not careful)
        // We handle /carrinho explicitly to allow it
        if (path === "/carrinho") return true;

        // Check if the path is public
        const isPublic = publicPaths.some((p) => {
          if (p === "/") return path === "/";
          return path.startsWith(p);
        });

        // Also allow API routes related to auth and public registration
        if (
          path.startsWith("/api/auth") ||
          path.startsWith("/api/register") ||
          path.startsWith("/_next") ||
          path.startsWith("/favicon.ico") ||
          path.startsWith("/logo-iron.png") ||
          path.startsWith("/favicons/") ||
          path.startsWith("/brands/")
        ) {
          return true;
        }

        // If it's a public path, allow access regardless of token
        if (isPublic) {
          return true;
        }

        // For all other paths (private), require a token
        return !!token;
      },
    },
  }
);

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
