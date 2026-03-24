# Mapa de migração de contexto (GEMINI.md → repositório)

Este arquivo registra o que existia em `GEMINI.md` (removido) e onde o contexto vive agora.

## Visão do produto

- **Antes:** `GEMINI.md` descrevia e-commerce B2B com registro, aprovação por admin e pedidos.
- **Agora:** [`README.md`](../../README.md) (visão geral) e este documento para histórico.

## Stack

| GEMINI.md (legado) | Estado atual |
|--------------------|--------------|
| Mencionava Shadcn/UI | Projeto usa **HeroUI** (`@heroui/react`) — ver [`AGENTS.md`](../../AGENTS.md) e [`package.json`](../../package.json). |
| Next.js App Router | Mantido — ver `README` e `AGENTS.md`. |
| Prisma + PostgreSQL | Mantido — `prisma/schema.prisma`. |
| NextAuth | Mantido — `src/lib/auth.ts`, [`docs/authentication.md`](../authentication.md). |

## Arquitetura de pastas

- `GEMINI.md` citava `app/(pages)/` — a árvore real usa rotas diretas em `app/` (ex.: `app/login`, `app/produtos`). Ver [`README.md`](../../README.md).

## Modelos de dados

- User, Product, Order, OrderItem continuam em `prisma/schema.prisma`. Não duplicar descrição longa aqui; fonte de verdade é o schema.

## Comandos e porta

- **Dev:** `pnpm dev` → **http://localhost:3001** (corrigido em relação ao legado que citava 3000).
- **Migrations:** `pnpm prisma migrate dev` (ou fluxo de deploy do time).

## IAs no repositório

- Regras versionadas: [`.cursor/rules/`](../../.cursor/rules/).
- Guia de uso: [`assistants.md`](assistants.md).
