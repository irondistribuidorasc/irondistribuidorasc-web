# GAP-001 - B2B Price Privacy Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-001-b2b-price-privacy.md`

## Resultado

GAP-001 foi corrigido no fluxo publico de catalogo, detalhe de produto e busca global.

Precos B2B agora so entram no payload client quando a sessao do usuario possui `approved === true`. Visitantes e usuarios pendentes recebem produtos sem `price` e resultados de busca sem `price`.

## Alteracoes Tecnicas

- Criado `src/lib/product-visibility.ts` para centralizar:
  - permissao de visualizacao de preco B2B;
  - DTO publico de produto com `price` opcional;
  - DTO publico de resultado de busca;
  - JSON-LD de produto sem `offers.price` quando o usuario nao puder ver preco.
- `app/produtos/page.tsx` passou a:
  - consultar sessao server-side;
  - montar produtos publicos com ou sem preco;
  - ignorar ordenacao por preco quando a sessao nao pode ver preco;
  - forcar render dinamico para evitar cache compartilhado entre usuarios.
- `app/produtos/[id]/page.tsx` passou a:
  - montar `ProductInfo` com produto publico;
  - montar JSON-LD condicionado por permissao;
  - forcar render dinamico.
- `app/actions/search-products.ts` passou a retornar `price` apenas para usuario aprovado.
- Componentes de catalogo passaram a aceitar `PublicProduct`.
- `ProductCard` e `ProductInfo` so permitem adicionar ao carrinho quando o produto visivel possui preco.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/productVisibility.test.ts` | Passou: 10 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 20 arquivos, 200 testes |
| `pnpm test:coverage` | Passou: 20 arquivos, 200 testes, cobertura geral 96.95% statements e 91.44% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |

## Observacoes

- O fluxo admin de busca/criacao manual de pedido nao foi alterado aqui. Ele pertence aos GAP-002/GAP-003.
- O build continua exigindo `DATABASE_URL` e `DIRECT_URL`; para validacao local foram usados placeholders nao secretos.
- Permanecem avisos nao bloqueantes sobre React Hook Form/React Compiler, `baseline-browser-mapping`, `caniuse-lite`, convencao `middleware` e Prisma config deprecated em `package.json`.

## Proximo Passo Recomendado

Atacar GAP-002 e GAP-003 juntos: pedido manual admin deve usar preco oficial do banco e validar/baixar estoque de forma transacional.
