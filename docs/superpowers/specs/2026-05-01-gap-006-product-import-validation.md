# GAP-006 - Validacao Numerica na Importacao CSV de Produtos

## Objetivo

Corrigir a importacao CSV de produtos para rejeitar valores numericos negativos ou invalidos antes de persistir dados no catalogo.

## Contexto

A auditoria encontrou que `POST /api/admin/products/import` validava apenas se `price` era `NaN`. Campos como `stockQuantity`, `minStockThreshold` e `popularity` eram normalizados com `parseInt` sem bloquear numeros negativos ou strings parcialmente numericas.

Isso permitia importar produto com preco negativo, estoque negativo, minimo negativo ou popularidade negativa, criando dados incoerentes para catalogo, estoque, alertas de reposicao e ordenacao.

## Escopo

- Centralizar a validacao e normalizacao de uma linha CSV de produto em helper testavel.
- Rejeitar `price` negativo ou invalido.
- Rejeitar `stockQuantity`, `minStockThreshold` e `popularity` negativos ou invalidos.
- Manter defaults atuais quando campos opcionais estiverem vazios:
  - `stockQuantity = 0`
  - `minStockThreshold = 10`
  - `popularity = 0`
- Manter validacao de categoria existente.
- Preservar o comportamento de importacao parcial: linhas invalidas entram em `errors`, linhas validas seguem para upsert.

## Fora de Escopo

- Alterar layout ou UX do componente de importacao.
- Criar nova tabela de auditoria de importacao.
- Alterar schema Prisma.
- Validar conteudo remoto de `imageUrl`.
- Alterar limite de tamanho ou quantidade de linhas por arquivo.

## Regras Aplicadas

- `price` deve ser numero finito e maior ou igual a zero.
- `stockQuantity` deve ser inteiro maior ou igual a zero.
- `minStockThreshold` deve ser inteiro maior ou igual a zero.
- `popularity` deve ser inteiro maior ou igual a zero.
- Campos inteiros nao aceitam valores parciais como `10abc` ou decimais como `1.5`.
- Campo opcional vazio usa o default existente.

## Criterios de Sucesso

- Linha com `price = -1` nao e importada.
- Linha com `stockQuantity = -1` nao e importada.
- Linha com `minStockThreshold = -1` nao e importada.
- Linha com `popularity = -1` nao e importada.
- Linha com inteiro invalido ou parcial nao e importada.
- Linha valida continua gerando o payload de upsert esperado.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para normalizacao de linha CSV valida.
2. Adicionar testes unitarios para rejeicao de numeros negativos e invalidos.
3. Alterar a rota de importacao para usar o helper centralizado.
4. Rodar teste focado.
5. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
