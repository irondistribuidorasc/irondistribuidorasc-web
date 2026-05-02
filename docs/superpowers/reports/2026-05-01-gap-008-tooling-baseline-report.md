# GAP-008 - Tooling Baseline Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-008-tooling-baseline.md`

## Resultado

GAP-008 foi reduzido de bloqueio de tooling para pre-requisito explicito de ambiente.

O problema principal era uma configuracao global do pnpm (`package-lock=false`) sendo interpretada como lockfile desabilitado. Isso fazia `pnpm install --frozen-lockfile` falhar mesmo com `pnpm-lock.yaml` presente.

Foi adicionada uma configuracao local em `.npmrc`:

```ini
lockfile=true
```

Com isso, a instalacao congelada voltou a funcionar no projeto.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `fnm exec --using=20 pnpm install --frozen-lockfile` | Passou |
| `fnm exec --using=20 pnpm lint` | Passou com 1 warning |
| `fnm exec --using=20 pnpm test:run` | Passou: 19 arquivos, 190 testes |
| `fnm exec --using=20 pnpm test:coverage` | Passou: cobertura geral 96.9% statements, 91.33% branches, 96.8% functions, 97.28% lines |
| `fnm exec --using=20 pnpm build` com variaveis placeholder nao secretas | Passou |

## Observacoes

- O projeto declara Node 20 em `.nvmrc`; a validacao foi executada com `fnm exec --using=20`.
- `pnpm lint` reporta warning em `src/components/admin/ProductForm.tsx:65` por uso de `watch()` do React Hook Form com React Compiler. Nao e erro bloqueante.
- `pnpm build` sem variaveis de ambiente falha antes do Next build porque `prisma.config.ts` exige `DATABASE_URL` e `DIRECT_URL`.
- O build foi validado com placeholders nao secretos para `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Ha avisos nao bloqueantes sobre `baseline-browser-mapping`, `caniuse-lite`, convencao deprecated de `middleware` e `package.json#prisma`.

## Proximo Passo Recomendado

Atacar o GAP-001: impedir que precos B2B sejam enviados ou publicados para usuarios nao aprovados.
