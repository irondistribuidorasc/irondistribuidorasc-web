# GAP-009 - Restauracao de Estoque ao Cancelar Pedido com Baixa Aplicada

## Objetivo

Corrigir o cancelamento administrativo de pedidos para restaurar estoque quando o pedido ja teve baixa aplicada.

## Contexto

A auditoria encontrou que clientes so conseguem cancelar pedidos `PENDING`, mas administradores podem mover qualquer pedido para `CANCELLED`. A baixa de estoque ja foi corrigida para ocorrer quando o pedido entra em status operacional ativo, mas a transicao posterior para `CANCELLED` nao devolvia os itens ao estoque.

Isso podia deixar o estoque artificialmente menor quando um pedido confirmado, em processamento, enviado ou entregue fosse cancelado pelo admin.

## Escopo

- Centralizar a regra de restauracao por transicao de status.
- Restaurar estoque quando a transicao for de status com baixa aplicada para `CANCELLED`.
- Manter cancelamento de pedido `PENDING` sem alterar estoque.
- Manter deducao ja corrigida para transicoes de status nao baixado para status baixado.
- Preservar idempotencia: chamada repetida ou corrida concorrente nao deve restaurar duas vezes.
- Manter notificacao ao usuario quando o status realmente mudar.

## Fora de Escopo

- Criar ledger de estoque.
- Criar historico/auditoria de movimentos de estoque.
- Bloquear cancelamento de `DELIVERED`.
- Criar fluxo de devolucao/troca.
- Alterar UI administrativa.

## Regra Aplicada

Statuses com baixa aplicada:

- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`

Ao mover qualquer um desses statuses para `CANCELLED`, o sistema incrementa `stockQuantity` dos produtos pelos itens do pedido e marca `inStock = true`.

## Criterios de Sucesso

- `PENDING -> CANCELLED` nao restaura estoque.
- `CONFIRMED -> CANCELLED` restaura estoque.
- `PROCESSING -> CANCELLED` restaura estoque.
- `SHIPPED -> CANCELLED` restaura estoque.
- `DELIVERED -> CANCELLED` restaura estoque enquanto a transicao for permitida pelo sistema.
- Chamada repetida para pedido ja `CANCELLED` nao restaura novamente.
- Produto ausente retorna conflito e nao conclui a transicao.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para a regra de restauracao.
2. Adicionar testes unitarios para montagem de restauracoes por itens.
3. Alterar `PATCH /api/admin/orders/[id]` para aplicar restauracao dentro da mesma transacao.
4. Rodar teste focado.
5. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
