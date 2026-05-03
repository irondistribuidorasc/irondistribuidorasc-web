# Iron Distribuidora SC — Web

Aplicação web full-stack (Next.js) para e-commerce B2B: clientes se registram, são aprovados por administradores e passam a realizar pedidos de produtos.

## Stack principal

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS** + **HeroUI** (`@heroui/react`)
- **PostgreSQL** + **Prisma 6**
- **NextAuth.js**
- **Vitest** + **React Testing Library**

## Pré-requisitos

- Node.js 24+ LTS (ver `.nvmrc`)
- pnpm 11.x
- [pnpm](https://pnpm.io/)
- Instância PostgreSQL (local ou remota)

## Como rodar

1. Clone o repositório e instale dependências:

   ```bash
   pnpm install
   ```

2. Configure variáveis de ambiente (use `.env.example` como referência). Em desenvolvimento costuma-se usar `.env` e `.env.local` (não versionados).

3. Aplique migrations e (opcional) seed:

   ```bash
   pnpm prisma migrate dev
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

   A aplicação fica em **http://localhost:3001**.

## Scripts úteis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Desenvolvimento |
| `pnpm build` | Build de produção + typecheck |
| `pnpm start` | Servidor após build |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (watch) |
| `pnpm test:run` | Vitest (execução única) |
| `pnpm test:coverage` | Cobertura (mín. 90% nas áreas configuradas) |

## Estrutura de pastas (resumo)

```
app/           # Rotas App Router, páginas e API routes (app/api/)
src/           # Componentes React, hooks, lib, contexts
prisma/        # schema.prisma e migrations
public/        # Assets estáticos
docs/          # Documentação (Brand Book, autenticação, IA)
```

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [AGENTS.md](./AGENTS.md) | Contrato do repositório para humanos e **assistentes de IA** |
| [docs/Brand_Book_Iron.md](./docs/Brand_Book_Iron.md) | Identidade visual (obrigatório para UI) |
| [docs/system-pillars.md](./docs/system-pillars.md) | Pilares técnicos atuais do sistema e pontos de auditoria futura |
| [docs/superpowers/specs/2026-05-01-system-gap-audit.md](./docs/superpowers/specs/2026-05-01-system-gap-audit.md) | Spec para auditoria end-to-end de gaps críticos do sistema |
| [docs/superpowers/specs/2026-05-01-gap-008-tooling-baseline.md](./docs/superpowers/specs/2026-05-01-gap-008-tooling-baseline.md) | Spec para restaurar tooling e baseline de validação |
| [docs/superpowers/specs/2026-05-01-gap-001-b2b-price-privacy.md](./docs/superpowers/specs/2026-05-01-gap-001-b2b-price-privacy.md) | Spec para privacidade de preços B2B |
| [docs/superpowers/specs/2026-05-01-gap-002-003-admin-order-pricing-stock.md](./docs/superpowers/specs/2026-05-01-gap-002-003-admin-order-pricing-stock.md) | Spec para preço oficial e estoque no pedido manual admin |
| [docs/superpowers/specs/2026-05-01-gap-004-order-status-stock-transition.md](./docs/superpowers/specs/2026-05-01-gap-004-order-status-stock-transition.md) | Spec para transição de status com baixa de estoque idempotente |
| [docs/superpowers/specs/2026-05-01-gap-005-finance-daily-summary.md](./docs/superpowers/specs/2026-05-01-gap-005-finance-daily-summary.md) | Spec para financeiro diário com pedidos elegíveis |
| [docs/superpowers/specs/2026-05-01-gap-006-product-import-validation.md](./docs/superpowers/specs/2026-05-01-gap-006-product-import-validation.md) | Spec para validação numérica na importação CSV de produtos |
| [docs/superpowers/specs/2026-05-01-gap-007-account-deletion-retention.md](./docs/superpowers/specs/2026-05-01-gap-007-account-deletion-retention.md) | Spec para exclusão de conta sem perda de histórico operacional |
| [docs/superpowers/specs/2026-05-01-gap-009-cancelled-order-stock-restore.md](./docs/superpowers/specs/2026-05-01-gap-009-cancelled-order-stock-restore.md) | Spec para restauração de estoque ao cancelar pedido com baixa aplicada |
| [docs/superpowers/specs/2026-05-01-gap-010-password-reset-token-hash.md](./docs/superpowers/specs/2026-05-01-gap-010-password-reset-token-hash.md) | Spec para hash de tokens de reset de senha |
| [docs/superpowers/specs/2026-05-02-gap-011-supabase-storage-upload-policy.md](./docs/superpowers/specs/2026-05-02-gap-011-supabase-storage-upload-policy.md) | Spec para policy versionada de upload Supabase Storage |
| [docs/superpowers/specs/2026-05-02-gap-012-checkout-validation-alignment.md](./docs/superpowers/specs/2026-05-02-gap-012-checkout-validation-alignment.md) | Spec para alinhamento da validação do checkout com a API |
| [docs/superpowers/specs/2026-05-02-gap-013-production-csp-inline-scripts.md](./docs/superpowers/specs/2026-05-02-gap-013-production-csp-inline-scripts.md) | Spec para CSP de produção sem `unsafe-inline` em scripts |
| [docs/superpowers/plans/2026-05-01-system-gap-audit.md](./docs/superpowers/plans/2026-05-01-system-gap-audit.md) | Plano de execução da auditoria end-to-end |
| [docs/superpowers/reports/2026-05-01-system-gap-audit-report.md](./docs/superpowers/reports/2026-05-01-system-gap-audit-report.md) | Relatório de gaps críticos e necessários encontrados na auditoria |
| [docs/superpowers/reports/2026-05-01-gap-008-tooling-baseline-report.md](./docs/superpowers/reports/2026-05-01-gap-008-tooling-baseline-report.md) | Resultado da correção do tooling e baseline de validação |
| [docs/superpowers/reports/2026-05-01-gap-001-b2b-price-privacy-report.md](./docs/superpowers/reports/2026-05-01-gap-001-b2b-price-privacy-report.md) | Resultado da correção de privacidade de preços B2B |
| [docs/superpowers/reports/2026-05-01-gap-002-003-admin-order-pricing-stock-report.md](./docs/superpowers/reports/2026-05-01-gap-002-003-admin-order-pricing-stock-report.md) | Resultado da correção de preço oficial e estoque no pedido manual admin |
| [docs/superpowers/reports/2026-05-01-gap-004-order-status-stock-transition-report.md](./docs/superpowers/reports/2026-05-01-gap-004-order-status-stock-transition-report.md) | Resultado da correção de transição de status e baixa idempotente de estoque |
| [docs/superpowers/reports/2026-05-01-gap-005-finance-daily-summary-report.md](./docs/superpowers/reports/2026-05-01-gap-005-finance-daily-summary-report.md) | Resultado da correção do financeiro diário com pedidos elegíveis |
| [docs/superpowers/reports/2026-05-01-gap-006-product-import-validation-report.md](./docs/superpowers/reports/2026-05-01-gap-006-product-import-validation-report.md) | Resultado da correção da validação numérica na importação CSV |
| [docs/superpowers/reports/2026-05-01-gap-007-account-deletion-retention-report.md](./docs/superpowers/reports/2026-05-01-gap-007-account-deletion-retention-report.md) | Resultado da correção de exclusão de conta com retenção operacional |
| [docs/superpowers/reports/2026-05-01-gap-009-cancelled-order-stock-restore-report.md](./docs/superpowers/reports/2026-05-01-gap-009-cancelled-order-stock-restore-report.md) | Resultado da correção de restauração de estoque no cancelamento |
| [docs/superpowers/reports/2026-05-01-gap-010-password-reset-token-hash-report.md](./docs/superpowers/reports/2026-05-01-gap-010-password-reset-token-hash-report.md) | Resultado da correção de hash dos tokens de reset de senha |
| [docs/superpowers/reports/2026-05-02-gap-011-supabase-storage-upload-policy-report.md](./docs/superpowers/reports/2026-05-02-gap-011-supabase-storage-upload-policy-report.md) | Resultado da correção de upload Supabase Storage versionado |
| [docs/superpowers/reports/2026-05-02-gap-012-checkout-validation-alignment-report.md](./docs/superpowers/reports/2026-05-02-gap-012-checkout-validation-alignment-report.md) | Resultado da correção de alinhamento da validação do checkout |
| [docs/superpowers/reports/2026-05-02-gap-013-production-csp-inline-scripts-report.md](./docs/superpowers/reports/2026-05-02-gap-013-production-csp-inline-scripts-report.md) | Resultado da correção de CSP de produção sem `unsafe-inline` em scripts |
| [docs/operations/supabase-storage-products.md](./docs/operations/supabase-storage-products.md) | Operação do bucket Supabase `products` |
| [docs/authentication.md](./docs/authentication.md) | Fluxos de autenticação |
| [docs/ai/assistants.md](./docs/ai/assistants.md) | Uso de Cursor rules, skills e agents |
| [docs/ai/migration-map.md](./docs/ai/migration-map.md) | Histórico de consolidação do contexto antigo |

## Commits e qualidade

- **Husky:** pre-commit roda lint e build; pre-push roda testes com cobertura.
- Commits convencionais via Commitizen (`pnpm commit`).

## Licença

Projeto privado (`private: true` no `package.json`).
