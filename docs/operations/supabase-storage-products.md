# Supabase Storage - Imagens de Produtos

## Objetivo

Manter o bucket `products` reproduzivel e seguro para imagens publicas do catalogo.

## Arquitetura

- Leitura das imagens: publica, via URL publica do bucket `products`.
- Upload das imagens: somente via rota server-side `POST /api/admin/products/image`.
- Autorizacao de upload: NextAuth, `session.user.role = ADMIN`.
- Credencial usada no upload: `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.

O browser nao faz mais upload direto para Supabase Storage com `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Variaveis de Ambiente

| Variavel | Escopo | Uso |
| --- | --- | --- |
| `SUPABASE_URL` | Server | URL do projeto Supabase para client admin |
| `NEXT_PUBLIC_SUPABASE_URL` | Public/Server fallback | Fallback de URL quando `SUPABASE_URL` nao estiver definida |
| `SUPABASE_SERVICE_ROLE_KEY` | Server secret | Upload admin server-side |

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente, em logs ou em variavel `NEXT_PUBLIC_*`.

## Politica Versionada

Arquivo fonte:

```text
supabase/migrations/20260502200330_products_storage_upload_policy.sql
supabase/migrations/20260503173234_remove_products_public_write_policies.sql
supabase/migrations/20260503173258_remove_products_public_listing_policies.sql
```

Esses SQLs:

- cria/atualiza o bucket `products`;
- mantem o bucket publico para leitura das imagens;
- restringe MIME types para `image/jpeg`, `image/png` e `image/webp`;
- limita o tamanho em 5 MB;
- remove policies nomeadas conhecidas de upload direto publico;
- remove policies amplas de listagem publica do bucket;
- nao mantem policy de `select`, `insert`, `update` ou `delete` para `anon`/`authenticated`.

## Aplicacao

Em ambiente conectado ao projeto Supabase:

```bash
supabase migration up
```

Se a migration for aplicada manualmente via SQL editor, execute o conteudo completo do arquivo acima e registre a aplicacao no checklist operacional do ambiente.

## Verificacao

Verificar bucket:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'products';
```

Verificar policies ativas no bucket:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    policyname ilike '%products%'
    or qual ilike '%products%'
    or with_check ilike '%products%'
    or policyname ilike 'Allow Public Uploads%'
  )
order by policyname;
```

Resultado esperado:

- bucket `products` existe;
- `public = true`;
- `file_size_limit = 5242880`;
- `allowed_mime_types` contem apenas `image/jpeg`, `image/png`, `image/webp`;
- nenhuma policy em `storage.objects` referencia o bucket `products`;
- nenhuma policy permite listagem, `insert`, `update` ou `delete` amplo para `anon`/`authenticated`.

## Observacao

Supabase Storage usa RLS em `storage.objects` para operacoes de escrita. Buckets publicos bypassam controle de acesso para servir/baixar arquivos, mas upload, update, move e delete continuam dependendo de policies ou service role.
