# Assistentes de IA no repositório (Cursor-first)

Este projeto versiona regras, skills e agents em [`.cursor/`](../../.cursor/) para alinhar o Cursor (e qualquer ferramenta que leia os mesmos arquivos) ao Brand Book e aos fluxos de backend/frontend.

## Ordem de leitura recomendada

1. [`AGENTS.md`](../../AGENTS.md) — contrato curto do repositório, stack e comandos.
2. [`docs/Brand_Book_Iron.md`](../Brand_Book_Iron.md) — antes de qualquer trabalho de UI.
3. [`.cursor/rules/`](../../.cursor/rules/) — regras modulares por domínio (core, frontend, API, Prisma, testes, middleware/CSP).

## Rules (`.cursor/rules/*.mdc`)

| Arquivo | Escopo |
|---------|--------|
| `00-core-project.mdc` | Sempre (stack, pnpm, porta 3001, env, qualidade) |
| `10-frontend-brand.mdc` | `**/*.tsx` — Brand Book, HeroUI |
| `20-api-auth.mdc` | `app/api/**`, `app/actions/**` |
| `30-prisma-data.mdc` | `prisma/**` |
| `40-testing-quality.mdc` | `**/*.test.*`, `**/*.spec.*` (+ `__tests__/`) |
| `50-middleware-csp.mdc` | `middleware.ts`, `next.config.ts` |

## Skills (`.cursor/skills/*/SKILL.md`)

Workflows reutilizáveis; o agente pode seguir quando a tarefa corresponder à descrição do skill.

| Skill | Quando usar |
|-------|-------------|
| `frontend-design` | UI nova, componentes, alinhamento com marca |
| `frontend-review` | Revisão de frontend, acessibilidade, UX |
| `backend-security-review` | Auditoria de API, auth, dados |
| `api-route-checklist` | Criar ou alterar API routes ou server actions |

## Agents (`.cursor/agents/*.md`)

Personas de apoio; use quando a tarefa for claramente de frontend, backend ou revisão geral.

| Agent | Foco |
|-------|------|
| `frontend.md` | Componentes, páginas, Tailwind, HeroUI |
| `backend.md` | API routes, Prisma, auth, validação |
| `code-reviewer.md` | Revisão antes de merge |

## Compatibilidade futura com Claude / CLAUDE.md

Se no futuro o time usar **Claude Code** com `CLAUDE.md`, recomenda-se um arquivo **curto** que apenas:

- aponte para `AGENTS.md` e `docs/Brand_Book_Iron.md`;
- liste comandos essenciais (`pnpm dev`, `pnpm build`, `pnpm test:coverage`);
- evite duplicar o mesmo conteúdo das rules e do `AGENTS.md`.

A fonte operacional detalhada deve continuar em [`.cursor/rules/`](../../.cursor/rules/) e em [`AGENTS.md`](../../AGENTS.md).

## Histórico

- Migração do contexto antigo: [`migration-map.md`](migration-map.md).
- Specs Kiro arquivadas: [`docs/archive/kiro-specs/`](../archive/kiro-specs/).
