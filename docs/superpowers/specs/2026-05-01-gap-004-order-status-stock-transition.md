# GAP-004 - Transicao de Status com Baixa de Estoque Idempotente

## Objetivo

Corrigir a transicao administrativa de status para impedir baixa duplicada de estoque, oversell silencioso e confirmacao de pedido sem estoque suficiente.

## Contexto

A auditoria encontrou que `PATCH /api/admin/orders/[id]` lia o pedido fora da transacao, decidia a baixa com base em snapshot antigo e reduzia estoque com `Math.max(0, estoque - quantidade)`. Em chamadas concorrentes, duas confirmacoes do mesmo pedido podiam deduzir estoque duas vezes. Quando o estoque era insuficiente, a rota apenas registrava warning e confirmava mesmo assim.

## Escopo

- Decidir baixa de estoque a partir da transicao de status.
- Baixar estoque apenas quando o status anterior nao baixava estoque e o novo status baixa estoque.
- Impedir dupla baixa em chamadas concorrentes.
- Bloquear transicao para status ativo quando estoque for insuficiente.
- Remover clamp silencioso para zero.
- Manter notificacao ao cliente quando a transicao for aplicada.

## Fora de Escopo

- Reverter estoque ao cancelar pedido ja ativo (GAP-009).
- Criar ledger/auditoria dedicada de status.
- Alterar schema Prisma.
- Alterar UX do seletor de status, exceto mensagens decorrentes da API.

## Regra de Status

Status que representam estoque ja baixado:

- `CONFIRMED`;
- `PROCESSING`;
- `SHIPPED`;
- `DELIVERED`.

Baixa deve ocorrer somente quando:

- status anterior nao esta nessa lista; e
- novo status esta nessa lista.

## Criterios de Sucesso

- `PENDING -> CONFIRMED` baixa estoque uma vez.
- `CONFIRMED -> PROCESSING` nao baixa novamente.
- `PENDING -> PROCESSING` baixa estoque.
- Confirmacao com estoque insuficiente retorna erro e nao altera status.
- Chamadas concorrentes para confirmar o mesmo pedido nao conseguem baixar estoque duas vezes.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para regra de transicao e validacao de estoque.
2. Atualizar a rota admin para usar transacao com claim atomico de status.
3. Rodar teste focado.
4. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
