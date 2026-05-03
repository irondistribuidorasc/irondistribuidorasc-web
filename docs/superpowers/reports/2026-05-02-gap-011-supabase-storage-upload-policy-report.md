# GAP-011 - Supabase Storage Upload Policy Report

Data: 2026-05-02

Spec: `docs/superpowers/specs/2026-05-02-gap-011-supabase-storage-upload-policy.md`

## Resultado

GAP-011 foi corrigido com mudanca arquitetural no upload e policy versionada.

O componente de upload de imagem nao envia mais arquivos diretamente do browser para Supabase Storage usando anon key. Agora o browser envia `FormData` para `POST /api/admin/products/image`, e a rota server-side exige sessao admin antes de fazer upload com `SUPABASE_SERVICE_ROLE_KEY`.

## Alteracoes Tecnicas

- Criado `app/api/admin/products/image/route.ts` para upload admin server-side.
- Criado `src/lib/supabase-admin.ts` para client Supabase server-side com service role e sem persistencia de sessao.
- Criado `src/lib/product-image-upload.ts` para centralizar:
  - bucket `products`;
  - prefixo `products/`;
  - limite de 5 MB;
  - MIME types permitidos;
  - geracao de path seguro.
- `src/components/admin/ImageUpload.tsx` passou a chamar a API interna em vez de `supabase.storage.from(...).upload(...)` no browser.
- Criada migration Supabase `supabase/migrations/20260502200330_products_storage_upload_policy.sql`.
- Criadas migrations complementares para remover policies legadas do Dashboard:
  - `supabase/migrations/20260503173234_remove_products_public_write_policies.sql`;
  - `supabase/migrations/20260503173258_remove_products_public_listing_policies.sql`.
- Criada documentacao operacional `docs/operations/supabase-storage-products.md`.
- `docs/system-pillars.md` foi atualizado para refletir o novo fluxo.

## Regra Aplicada

- Upload: apenas admin autenticado pelo NextAuth.
- Escrita no bucket: server-side com `SUPABASE_SERVICE_ROLE_KEY`.
- Leitura: bucket `products` publico para imagens de catalogo via URL publica.
- Listagem: sem policy publica em `storage.objects`.
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`.
- Tamanho maximo: 5 MB.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/productImageUpload.test.ts src/lib/__tests__/supabaseAdmin.test.ts` | Passou: 8 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 26 arquivos, 241 testes |
| `pnpm test:coverage` | Passou: 26 arquivos, 241 testes, cobertura geral 96.81% statements e 91.23% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |
| `git diff --check` | Passou |
| MCP Supabase `apply_migration` em producao | Passou: `products_storage_upload_policy`, `remove_products_public_write_policies`, `remove_products_public_listing_policies` |
| MCP Supabase verificacao de bucket/policies | Passou: bucket `products` publico, 5 MB, MIME types restritos, sem policies publicas de listagem/escrita |

## Validacao Operacional

Migrations aplicadas no projeto Supabase `vvgxwlnxyhtxvariqnba`.

Ainda e necessario garantir `SUPABASE_SERVICE_ROLE_KEY` no ambiente server-side antes de testar upload real.

## Proximo Passo Recomendado

Atacar GAP-012: alinhar validacao do checkout na UI com os campos obrigatorios exigidos pela API.
