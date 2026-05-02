# GAP-011 - Politica Versionada para Upload de Imagens no Supabase Storage

## Objetivo

Corrigir o fluxo de upload de imagem de produtos para nao depender de uma policy Supabase invisivel no repositorio.

## Contexto

A auditoria encontrou que `src/components/admin/ImageUpload.tsx` fazia upload direto do browser para o bucket `products` usando o client Supabase com `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Esse desenho faz a seguranca real depender totalmente das policies configuradas fora do repo. Se o bucket permitir `insert` anonimo amplo, qualquer pessoa com a anon key publica pode enviar arquivos.

## Escopo

- Intermediar upload de imagem por rota server-side admin.
- Validar autenticacao e `role = ADMIN` antes do upload.
- Validar tipo e tamanho do arquivo no servidor.
- Usar client Supabase server-side com service role.
- Manter bucket `products` publico para leitura das imagens de catalogo.
- Versionar SQL do bucket/restricoes/policies em `supabase/migrations`.
- Documentar aplicacao e verificacao das policies.

## Fora de Escopo

- Migrar imagens existentes.
- Criar bucket privado com URLs assinadas.
- Criar remocao automatica de imagem antiga.
- Alterar UI visual do upload.
- Alterar dominio Supabase configurado no `next.config.ts`.

## Regra Aplicada

- Browser envia arquivo para `/api/admin/products/image`.
- A rota exige sessao admin via NextAuth.
- A rota aceita apenas `image/jpeg`, `image/png` e `image/webp`.
- A rota aceita arquivo ate 5 MB.
- O bucket `products` permanece publico apenas para leitura/entrega das imagens.
- Upload nao exige policy `insert` para `anon` ou `authenticated`, porque e feito server-side com service role.

## Criterios de Sucesso

- `ImageUpload` nao importa mais o client Supabase publico.
- Upload direto ao bucket via browser deixa de existir.
- Rota server-side valida admin, tipo e tamanho antes do upload.
- SQL versionado define bucket `products`, limites e remove policies nomeadas de upload amplo.
- Documentacao explica env `SUPABASE_SERVICE_ROLE_KEY` e passos de verificacao.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para validacao/metadados de upload.
2. Criar rota `/api/admin/products/image`.
3. Alterar `ImageUpload` para enviar `FormData` para a rota.
4. Versionar SQL em `supabase/migrations`.
5. Documentar operacao Supabase.
6. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage`, `pnpm build` e `git diff --check`.
