import { NextRequest, NextResponse } from "next/server";

function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean);
  if (fromEnv?.length) return fromEnv;

  const origins = [
    "https://irondistribuidorasc.com.br",
    "https://www.irondistribuidorasc.com.br",
  ];

  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3001");
  }

  return origins;
}

/**
 * Valida se a requisição vem de um origin permitido.
 * Retorna NextResponse com 403 se inválido, ou null se válido.
 */
export function validateCsrfOrigin(
  request: NextRequest
): NextResponse | null {
  const origin =
    request.headers.get("origin") || request.headers.get("referer");

  if (!origin) {
    return NextResponse.json(
      { error: "Origin obrigatório" },
      { status: 403 }
    );
  }

  const allowed = getAllowedOrigins();
  const isAllowed = allowed.some((domain) => origin.startsWith(domain));

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Origin não permitido" },
      { status: 403 }
    );
  }

  return null;
}
