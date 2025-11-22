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
      if (!token) {
        const callbackUrl = encodeURIComponent(req.url);
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
        );
      }
      
      // Verificar se conta está aprovada
      if (token.approved === false) {
        return NextResponse.redirect(
          new URL("/conta-pendente", req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/carrinho/checkout"],
};
