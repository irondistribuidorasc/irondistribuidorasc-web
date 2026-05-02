# GAP-005 - Financeiro Diario com Pedidos Elegiveis

## Objetivo

Corrigir o resumo financeiro diario para nao somar pedidos ainda pendentes, confirmados, em processamento, enviados ou cancelados como receita realizada.

## Contexto

A auditoria encontrou que `GET /api/admin/finance` somava todos os pedidos criados no dia exceto `CANCELLED`. Isso fazia pedidos `PENDING`, `CONFIRMED`, `PROCESSING` e `SHIPPED` entrarem no fechamento como se ja fossem venda concluida/paga.

O sistema ainda nao possui modelo de pagamento, `paidAt`, `deliveredAt` ou ledger financeiro. Portanto, nesta etapa a regra conservadora usa o status final existente: `DELIVERED`.

## Escopo

- Centralizar a regra de pedidos elegiveis para financeiro.
- Alterar `GET /api/admin/finance` para consultar apenas pedidos `DELIVERED`.
- Manter o agrupamento por forma de pagamento.
- Manter a data baseada em `createdAt` enquanto nao houver data financeira propria.
- Documentar a limitacao de data financeira.

## Fora de Escopo

- Criar modelo de pagamento.
- Criar ledger financeiro.
- Adicionar `paidAt` ou `deliveredAt`.
- Migrar dados historicos.
- Alterar layout visual da pagina financeira.

## Regra Aplicada

Nesta etapa, entra no resumo financeiro diario apenas pedido com:

- `status = DELIVERED`;
- `createdAt` dentro do dia selecionado.

## Criterios de Sucesso

- Pedido `PENDING` nao entra no total.
- Pedido `CONFIRMED` nao entra no total.
- Pedido `PROCESSING` nao entra no total.
- Pedido `SHIPPED` nao entra no total.
- Pedido `CANCELLED` nao entra no total.
- Pedido `DELIVERED` entra no total e no bucket correto de pagamento.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para elegibilidade e resumo financeiro.
2. Alterar a rota financeira para usar a regra.
3. Rodar teste focado.
4. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
