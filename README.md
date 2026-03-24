# Iron Distribuidora SC — Web

Aplicação web full-stack (Next.js) para e-commerce B2B: clientes se registram, são aprovados por administradores e passam a realizar pedidos de produtos.

## Stack principal

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS** + **HeroUI** (`@heroui/react`)
- **PostgreSQL** + **Prisma 6**
- **NextAuth.js**
- **Vitest** + **React Testing Library**

## Pré-requisitos

- Node.js 20+ (ver `.nvmrc`)
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
| [docs/authentication.md](./docs/authentication.md) | Fluxos de autenticação |
| [docs/ai/assistants.md](./docs/ai/assistants.md) | Uso de Cursor rules, skills e agents |
| [docs/ai/migration-map.md](./docs/ai/migration-map.md) | Histórico de consolidação do contexto antigo |

## Commits e qualidade

- **Husky:** pre-commit roda lint e build; pre-push roda testes com cobertura.
- Commits convencionais via Commitizen (`pnpm commit`).

## Licença

Projeto privado (`private: true` no `package.json`).
