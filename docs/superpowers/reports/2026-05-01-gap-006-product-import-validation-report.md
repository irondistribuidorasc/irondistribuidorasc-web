# GAP-006 - Product Import Validation Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-006-product-import-validation.md`

## Resultado

GAP-006 foi corrigido na validacao de importacao CSV de produtos.

`POST /api/admin/products/import` agora usa um normalizador centralizado antes de montar o payload de upsert. Linhas com `price`, `stockQuantity`, `minStockThreshold` ou `popularity` negativos, invalidos ou parcialmente numericos passam a entrar em `errors` e nao sao persistidas.

## Alteracoes Tecnicas

- `src/lib/productImport.ts` passou a centralizar:
  - contrato de linha CSV (`ImportedProductRow`);
  - contrato do payload normalizado (`ImportedProductData`);
  - validacao de categoria;
  - validacao estrita de preco decimal nao negativo;
  - validacao estrita de inteiros nao negativos;
  - normalizacao de defaults e tags.
- `app/api/admin/products/import/route.ts` passou a delegar a normalizacao da linha para `normalizeImportedProductRow`.
- `src/lib/__tests__/productImport.test.ts` ganhou cobertura para:
  - linha valida com defaults;
  - linha valida com opcionais;
  - rejeicao de negativos;
  - rejeicao de inteiros invalidos ou parciais;
  - rejeicao de preco invalido;
  - preservacao do erro de categoria invalida.

## Regras Aplicadas

- `price` deve ser numero finito maior ou igual a zero.
- `stockQuantity` deve ser inteiro maior ou igual a zero.
- `minStockThreshold` deve ser inteiro maior ou igual a zero.
- `popularity` deve ser inteiro maior ou igual a zero.
- Campos inteiros nao aceitam valores parciais como `10abc` nem decimais como `1.5`.
- Campos opcionais vazios preservam os defaults anteriores.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/productImport.test.ts` | Passou: 15 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 22 arquivos, 223 testes |
| `pnpm test:coverage` | Passou: 22 arquivos, 223 testes, cobertura geral 96.73% statements e 91.02% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |
| `git diff --check` | Passou |

## Proximo Passo Recomendado

Atacar GAP-007: revisar exclusao de conta para impedir perda/cascade indevido de pedidos, historico e registros que precisam permanecer auditaveis.
