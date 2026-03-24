# Repository Guidelines

Contrato curto para humanos e assistentes. Detalhes operacionais: [`.cursor/rules/`](.cursor/rules/).

## Identidade visual

**Obrigatório:** Antes de UI nova ou alteração visual, consultar [`docs/Brand_Book_Iron.md`](docs/Brand_Book_Iron.md). Qualidade estética e padrões de componentes: [`.cursor/skills/frontend-design/SKILL.md`](.cursor/skills/frontend-design/SKILL.md).

## Stack

| Área | Tecnologia |
|------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Linguagem | TypeScript (strict) |
| UI | Tailwind CSS, HeroUI (`@heroui/react`), Inter |
| Dados | PostgreSQL, Prisma 6 |
| Auth | NextAuth.js 4 |
| Testes | Vitest, React Testing Library |
| Imports | Alias `@/*` ([`tsconfig.json`](tsconfig.json)) |

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Dev server em http://localhost:3001 |
| `pnpm build` | Build de produção + typecheck |
| `pnpm start` | Servidor após build |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (watch) |
| `pnpm test:run` | Vitest uma execução |
| `pnpm test:coverage` | Cobertura (mín. 90% nas áreas configuradas) |

## Onde ler mais

| Recurso | Conteúdo |
|---------|----------|
| [`.cursor/rules/`](.cursor/rules/) | Regras por domínio (brand, API, Prisma, testes, middleware/CSP) |
| [`.cursor/skills/`](.cursor/skills/) | Workflows (design, reviews, checklist de API) |
| [`.cursor/agents/`](.cursor/agents/) | Personas (frontend, backend, code-reviewer) |
| [`docs/authentication.md`](docs/authentication.md) | Autenticação e fluxos |
| [`docs/ai/assistants.md`](docs/ai/assistants.md) | Uso de assistentes no projeto |

## Estrutura principal

- `app/` — rotas App Router, `app/api/` — API routes
- `src/components/` — componentes React
- `src/lib/` — auth, Prisma, utilitários, schemas
- `prisma/` — schema e migrations
- `public/` — assets estáticos

## Estilo e testes

- Componentes funcionais, JSX conciso, dois espaços de indentação.
- Testes em `src/**/__tests__/` ou `*.test.ts(x)` / `*.spec.ts(x)`; assertions focadas em comportamento visível.
- Pre-push: `pnpm test:coverage` (Husky).

## Commits e PRs

Assuntos curtos no imperativo; PRs com resumo, issue vinculada, screenshots se UI, plano de testes, menção a riscos em migrations ou tooling compartilhado.

## Ambiente

Segredos em `.env.local` (gitignored). Novas variáveis: documentar no PR.
